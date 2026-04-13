'use client';

import { useState, useRef, useEffect } from 'react';

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
}

interface AnswerResult {
  success: boolean;
  reason: string;
  message: string;
  winner?: Winner;
}

interface QuestionCardProps {
  question: Question | null;
  isLocked: boolean;
  winner: Winner | null;
  lastResult: AnswerResult | null;
  onSubmit: (answer: string, questionId: string) => void;
  currentUserId: string;
}

export default function QuestionCard({
  question,
  isLocked,
  winner,
  lastResult,
  onSubmit,
  currentUserId,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAnswer('');
    if (inputRef.current) inputRef.current.focus();
  }, [question?.id]);

  useEffect(() => {
    if (!question || isLocked) return;
    const interval = setInterval(() => {
      setElapsed(((Date.now() - question.startTime) / 1000));
    }, 100);
    return () => clearInterval(interval);
  }, [question, isLocked]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || isLocked || !answer.trim()) return;
    onSubmit(answer.trim(), question.id);
    setAnswer('');
    if (inputRef.current) inputRef.current.focus();
  };

  if (!question) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="animate-pulse text-gray-400 text-lg">
          Loading question...
        </div>
      </div>
    );
  }

  const isCurrentUserWinner = winner?.userId === currentUserId;

  return (
    <div
      className={`bg-gray-900 border rounded-2xl p-8 transition-all duration-300 ${
        isLocked
          ? isCurrentUserWinner
            ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
            : 'border-amber-500 shadow-lg shadow-amber-500/20'
          : 'border-gray-800 animate-pulse-glow'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-500 font-mono">
          #{question.questionNumber}
        </span>
        {!isLocked && (
          <span className="text-sm text-gray-500 font-mono tabular-nums">
            {elapsed.toFixed(1)}s
          </span>
        )}
      </div>

      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider">
          Solve
        </p>
        <p className="text-5xl md:text-6xl font-bold font-mono tracking-tight text-white">
          {question.expression}
        </p>
      </div>

      {isLocked && winner ? (
        <div
          className={`text-center py-4 rounded-xl ${
            isCurrentUserWinner
              ? 'bg-emerald-900/30 border border-emerald-800'
              : 'bg-gray-800/50 border border-gray-700'
          }`}
        >
          {isCurrentUserWinner ? (
            <>
              <p className="text-2xl font-bold text-emerald-400 mb-1">
                You Won!
              </p>
              <p className="text-sm text-emerald-500">
                Solved in {(winner.responseTimeMs / 1000).toFixed(2)}s
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-amber-400 mb-1">
                {winner.username} won this round!
              </p>
              <p className="text-sm text-gray-400">
                Answered in {(winner.responseTimeMs / 1000).toFixed(2)}s
              </p>
            </>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Next question in a few seconds...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="w-full px-5 py-4 bg-gray-800 border border-gray-700 rounded-xl text-center text-2xl font-mono text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            autoFocus
            disabled={isLocked}
          />
          <button
            type="submit"
            disabled={isLocked || !answer.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl text-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        </form>
      )}

      {lastResult && !isLocked && (
        <div
          className={`mt-4 text-center py-3 rounded-lg text-sm ${
            lastResult.reason === 'wrong_answer'
              ? 'bg-red-900/30 text-red-400 animate-shake'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          {lastResult.message}
        </div>
      )}
    </div>
  );
}
