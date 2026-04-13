interface UserScore {
  userId: string;
  username: string;
  totalWins: number;
  responseTimes: number[];
  averageResponseTime: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  userId: string;
  totalWins: number;
  averageResponseTime: number;
}

export default class ScoreTracker {
  private scores: Map<string, UserScore>;

  constructor() {
    this.scores = new Map();
  }

  registerUser(userId: string, username: string): UserScore {
    if (!this.scores.has(userId)) {
      this.scores.set(userId, {
        userId,
        username,
        totalWins: 0,
        responseTimes: [],
        averageResponseTime: 0,
      });
    }
    return this.scores.get(userId)!;
  }

  recordWin(userId: string, responseTimeMs: number): UserScore | null {
    const user = this.scores.get(userId);
    if (!user) return null;

    user.totalWins++;
    user.responseTimes.push(responseTimeMs);
    user.averageResponseTime =
      user.responseTimes.reduce((a, b) => a + b, 0) / user.responseTimes.length;

    return user;
  }

  getLeaderboard(limit: number = 10): LeaderboardEntry[] {
    const users = Array.from(this.scores.values());
    return users
      .sort((a, b) => {
        if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
        return a.averageResponseTime - b.averageResponseTime;
      })
      .slice(0, limit)
      .map((user, index) => ({
        rank: index + 1,
        username: user.username,
        userId: user.userId,
        totalWins: user.totalWins,
        averageResponseTime: Math.round(user.averageResponseTime),
      }));
  }
}
