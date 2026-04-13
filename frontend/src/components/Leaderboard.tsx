'use client';

import { useEffect, useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  userId: string;
  totalWins: number;
  averageResponseTime: number;
}

const RAW_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const BACKEND_URL = RAW_BACKEND_URL.startsWith('http') ? RAW_BACKEND_URL : `https://${RAW_BACKEND_URL}`;

export default function Leaderboard({ currentUserId }: { currentUserId: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/quiz/leaderboard?limit=10`);
        const data = await res.json();
        if (data.success) setLeaderboard(data.data);
      } catch {
        // silently fail — leaderboard is non-critical
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 3000);
    return () => clearInterval(interval);
  }, []);

  const rankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-xl">🏆</span> High Scores
      </h2>

      {leaderboard.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          No scores yet. Be the first to win!
        </p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                entry.userId === currentUserId
                  ? 'bg-indigo-900/30 border border-indigo-800'
                  : 'bg-gray-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono w-8 text-center">
                  {rankEmoji(entry.rank)}
                </span>
                <p className="text-sm font-medium text-white">
                  {entry.username}
                  {entry.userId === currentUserId && (
                    <span className="text-xs text-indigo-400 ml-1">(you)</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-indigo-400">
                  {entry.totalWins} wins
                </p>
                <p className="text-xs text-gray-500">
                  avg {(entry.averageResponseTime / 1000).toFixed(1)}s
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
