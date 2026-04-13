import express, { Router } from "express";
import QuizController from "../controllers/quizController.ts";

export default function createQuizRoutes(
  quizController: QuizController,
): Router {
  const router = express.Router();

  router.get("/leaderboard", (req, res) =>
    quizController.getLeaderboard(req, res),
  );

  return router;
}
