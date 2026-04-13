'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '@/hooks/useSocket';
import QuestionCard from '@/components/QuestionCard';
import Leaderboard from '@/components/Leaderboard';
import StatusBar from '@/components/StatusBar';

export default function Home() {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [inputName, setInputName] = useState('');

  useEffect(() => {
    const storedId = localStorage.getItem('mathquiz_userId');
    const storedName = localStorage.getItem('mathquiz_username');
    if (storedId && storedName) {
      setUserId(storedId);
      setUsername(storedName);
      setJoined(true);
    } else {
      setUserId(uuidv4());
    }
  }, []);

  const { connected, questionState, lastResult, userCount, submitAnswer } =
    useSocket(joined ? userId : '', joined ? username : '');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = inputName.trim();
    if (!name) return;
    setUsername(name);
    setJoined(true);
    localStorage.setItem('mathquiz_userId', userId);
    localStorage.setItem('mathquiz_username', name);
  };

  if (!joined) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              ⚡ Math Arena
            </h1>
            <p className="text-gray-400">
              Race to solve math problems. First correct answer wins.
            </p>
          </div>

          <form
            onSubmit={handleJoin}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6"
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Choose your display name
              </label>
              <input
                id="username"
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. MathWizard42"
                maxLength={20}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!inputName.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl text-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              Enter Arena
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">⚡ Math Arena</h1>
        <p className="text-gray-500 text-sm">
          First correct answer wins. Be fast, be accurate.
        </p>
      </header>

      <StatusBar
        connected={connected}
        userCount={userCount}
        username={username}
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuestionCard
            question={questionState.question}
            isLocked={questionState.isLocked}
            winner={questionState.winner}
            lastResult={lastResult}
            onSubmit={submitAnswer}
            currentUserId={userId}
          />
        </div>
        <div>
          <Leaderboard currentUserId={userId} />
        </div>
      </div>

      <footer className="mt-12 text-center text-xs text-gray-600">
        <p>
          Server timestamps all answers to ensure fairness regardless of network
          latency.
        </p>
        <p className="mt-1">
          Concurrency handled via Node.js single-threaded event loop — first
          correct answer locks the round atomically.
        </p>
      </footer>
    </main>
  );
}
