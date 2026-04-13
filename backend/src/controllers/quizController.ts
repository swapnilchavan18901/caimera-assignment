import { Request, Response } from 'express';
import QuizManager from '../classes/QuizManager.ts';

export default class QuizController {
  private quizManager: QuizManager;

  constructor(quizManager: QuizManager) {
    this.quizManager = quizManager;
  }

  getLeaderboard(req: Request, res: Response): void {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = this.quizManager.getLeaderboard(limit);
    res.json({ success: true, data: leaderboard });
  }

}
