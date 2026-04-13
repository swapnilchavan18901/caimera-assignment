import QuestionGenerator from "./QuestionGenerator.ts";
import ScoreTracker from "./ScoreTracker.ts";
import { v4 as uuidv4 } from "uuid";
import { Server as SocketIOServer } from "socket.io";

interface Question {
  expression: string;
  answer: number;
  questionNumber: number;
}

interface SafeQuestion {
  id: string;
  expression: string;
  questionNumber: number;
  startTime: number;
}

interface Winner {
  userId: string;
  username: string;
  responseTimeMs: number;
  answeredAt: number;
}

interface ConnectedUser {
  userId: string;
  username: string;
  connectedAt: number;
}

interface QuestionState {
  question: SafeQuestion | null;
  isLocked: boolean;
  winner: Winner | null;
  connectedUsers: number;
}

interface SubmitAnswerResult {
  success: boolean;
  reason: string;
  message: string;
  winner?: Winner;
  responseTimeMs?: number;
}

interface QuestionHistoryEntry {
  question: string;
  answer: number;
  winner: Winner;
  questionId: string;
}

export default class QuizManager {
  private questionGenerator: QuestionGenerator;
  private scoreTracker: ScoreTracker;
  private currentQuestion: Question | null;
  private questionId: string | null;
  private questionStartTime: number | null;
  private isLocked: boolean;
  private winner: Winner | null;
  public connectedUsers: Map<string, ConnectedUser>;
  private questionHistory: QuestionHistoryEntry[];
  private io: SocketIOServer | null;

  constructor() {
    this.questionGenerator = new QuestionGenerator();
    this.scoreTracker = new ScoreTracker();
    this.currentQuestion = null;
    this.questionId = null;
    this.questionStartTime = null;
    this.isLocked = false;
    this.winner = null;
    this.connectedUsers = new Map();
    this.questionHistory = [];
    this.io = null;

    this._generateNewQuestion();
  }

  setSocketIO(io: SocketIOServer): void {
    this.io = io;
  }

  private _generateNewQuestion(): SafeQuestion | null {
    const question = this.questionGenerator.generate();
    this.questionId = uuidv4();
    this.currentQuestion = question;
    this.questionStartTime = Date.now();
    this.isLocked = false;
    this.winner = null;
    return this._getSafeQuestion();
  }

  private _getSafeQuestion(): SafeQuestion | null {
    if (!this.currentQuestion || !this.questionId || !this.questionStartTime)
      return null;
    return {
      id: this.questionId,
      expression: this.currentQuestion.expression,
      questionNumber: this.currentQuestion.questionNumber,
      startTime: this.questionStartTime,
    };
  }

  registerUser(userId: string, username: string): ConnectedUser {
    this.connectedUsers.set(userId, {
      userId,
      username,
      connectedAt: Date.now(),
    });
    this.scoreTracker.registerUser(userId, username);
    return this.connectedUsers.get(userId)!;
  }

  getCurrentQuestion(): QuestionState {
    return {
      question: this._getSafeQuestion(),
      isLocked: this.isLocked,
      winner: this.winner,
      connectedUsers: this.connectedUsers.size,
    };
  }

  /**
   * Handles answer submission with concurrency control.
   * Uses a synchronous lock check + set pattern.
   * Since Node.js is single-threaded, the check-and-set on `this.isLocked`
   * is atomic within a single event loop tick — no race condition possible.
   * Server timestamps the submission to neutralize network latency differences.
   */
  submitAnswer(
    userId: string,
    username: string,
    answer: number,
    questionId: string,
  ): SubmitAnswerResult {
    if (questionId !== this.questionId) {
      return {
        success: false,
        reason: "stale_question",
        message: "This question has already changed. Wait for the new one.",
      };
    }

    if (this.isLocked) {
      return {
        success: false,
        reason: "already_answered",
        message: `Too late! ${this.winner!.username} already answered correctly.`,
        winner: this.winner!,
      };
    }

    const serverTimestamp = Date.now();
    const responseTimeMs = serverTimestamp - this.questionStartTime!;
    const numericAnswer = Number(answer);

    if (isNaN(numericAnswer)) {
      return {
        success: false,
        reason: "invalid_answer",
        message: "Please provide a numeric answer.",
      };
    }

    if (numericAnswer !== this.currentQuestion!.answer) {
      return {
        success: false,
        reason: "wrong_answer",
        message: "Incorrect answer. Try again!",
      };
    }

    this.isLocked = true;
    this.winner = {
      userId,
      username,
      responseTimeMs,
      answeredAt: serverTimestamp,
    };

    this.scoreTracker.recordWin(userId, responseTimeMs);

    this.questionHistory.push({
      question: this.currentQuestion!.expression,
      answer: this.currentQuestion!.answer,
      winner: this.winner,
      questionId: this.questionId!,
    });

    if (this.io) {
      this.io.emit("question_solved", {
        winner: this.winner,
        correctAnswer: this.currentQuestion!.answer,
        question: this.currentQuestion!.expression,
      });
    }

    setTimeout(() => {
      this.nextQuestion();
    }, 5000);

    return {
      success: true,
      reason: "correct",
      message: "Correct! You are the winner!",
      winner: this.winner,
      responseTimeMs,
    };
  }

  nextQuestion(): SafeQuestion | null {
    const question = this._generateNewQuestion();
    if (this.io) {
      this.io.emit("new_question", {
        question,
        connectedUsers: this.connectedUsers.size,
      });
    }
    return question;
  }

  getLeaderboard(limit: number = 10) {
    return this.scoreTracker.getLeaderboard(limit);
  }
}
