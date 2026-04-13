"use client";

interface StatusBarProps {
  connected: boolean;
  userCount: number;
  username: string;
}

export default function StatusBar({
  connected,
  userCount,
  username,
}: StatusBarProps) {
  return (
    <div className="flex items-center justify-between text-sm text-gray-400 bg-gray-900/50 border border-gray-800 rounded-xl px-5 py-3">
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            connected ? "bg-emerald-500" : "bg-red-500"
          }`}
        />
        <span>{connected ? "Connected" : "Reconnecting..."}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>👤 {username}</span>
        {/* <span>🌐 {userCount} online</span> */}
      </div>
    </div>
  );
}
