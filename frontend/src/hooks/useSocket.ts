import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface Question {
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

interface AnswerResult {
  success: boolean;
  reason: string;
  message: string;
  winner?: Winner;
  responseTimeMs?: number;
}

interface QuestionState {
  question: Question | null;
  isLocked: boolean;
  winner: Winner | null;
  connectedUsers: number;
}

export function useSocket(userId: string, username: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [questionState, setQuestionState] = useState<QuestionState>({
    question: null,
    isLocked: false,
    winner: null,
    connectedUsers: 0,
  });
  const [lastResult, setLastResult] = useState<AnswerResult | null>(null);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    if (!userId || !username) return;

    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", { userId, username });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("current_question", (data: QuestionState) => {
      setQuestionState(data);
      setUserCount(data.connectedUsers);
      setLastResult(null);
    });

    socket.on(
      "new_question",
      (data: { question: Question; connectedUsers: number }) => {
        setQuestionState({
          question: data.question,
          isLocked: false,
          winner: null,
          connectedUsers: data.connectedUsers,
        });
        setLastResult(null);
        setUserCount(data.connectedUsers);
      },
    );

    socket.on(
      "question_solved",
      (data: { winner: Winner; correctAnswer: number; question: string }) => {
        setQuestionState((prev) => ({
          ...prev,
          isLocked: true,
          winner: data.winner,
        }));
      },
    );

    socket.on("answer_result", (data: AnswerResult) => {
      setLastResult(data);
    });

    socket.on("user_count", (data: { count: number }) => {
      setUserCount(data.count);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, username]);

  const submitAnswer = useCallback(
    (answer: string, questionId: string) => {
      if (socketRef.current) {
        setLastResult(null);
        socketRef.current.emit("submit_answer", {
          userId,
          username,
          answer: Number(answer),
          questionId,
        });
      }
    },
    [userId, username],
  );

  return {
    connected,
    questionState,
    lastResult,
    userCount,
    submitAnswer,
  };
}
