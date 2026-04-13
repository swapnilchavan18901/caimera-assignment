import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import QuizManager from "./classes/QuizManager.ts";
import QuizController from "./controllers/quizController.ts";
import createQuizRoutes from "./routes/quizRoutes.ts";

const PORT = process.env.PORT || 4000;
const RAW_FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const ALLOWED_ORIGINS = RAW_FRONTEND_URL.split(",").map((url) =>
  url.trim().replace(/\/+$/, ""),
);

const app = express();
const server = http.createServer(app);

const corsOriginCheck = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => {
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error(`CORS: origin ${origin} not allowed`));
  }
};

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: corsOriginCheck }));
app.use(express.json());

const quizManager = new QuizManager();
quizManager.setSocketIO(io);

const quizController = new QuizController(quizManager);
const quizRoutes = createQuizRoutes(quizController);

app.use("/api/quiz", quizRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

interface JoinData {
  userId: string;
  username: string;
}

interface SubmitAnswerData {
  userId: string;
  username: string;
  answer: number;
  questionId: string;
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join", ({ userId, username }: JoinData) => {
    quizManager.registerUser(userId, username);
    io.emit("user_count", { count: quizManager.connectedUsers.size });
    socket.emit("current_question", quizManager.getCurrentQuestion());
  });

  socket.on(
    "submit_answer",
    ({ userId, username, answer, questionId }: SubmitAnswerData) => {
      quizManager.registerUser(userId, username);
      const result = quizManager.submitAnswer(
        userId,
        username,
        answer,
        questionId,
      );
      socket.emit("answer_result", result);
    },
  );

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    io.emit("user_count", { count: quizManager.connectedUsers.size });
  });
});

server.listen(PORT, () => {
  console.log(`Math Quiz Server running on http://localhost:${PORT}`);
  console.log(`API endpoints: http://localhost:${PORT}/api/quiz`);
});
