# ⚡ Math Arena — Competitive Math Quiz

A real-time competitive math quiz where multiple users race to solve dynamically generated math problems. The first correct answer wins the round.

## Architecture

```
backend/   — Express + Socket.IO server (Node.js, OOP, in-memory storage)
frontend/  — Next.js (React, Tailwind CSS, Socket.IO client)
```

## How It Works

1. Users join with a display name
2. Everyone sees the **same math problem** simultaneously via WebSocket
3. The **first user to submit the correct answer** wins the round
4. A new question auto-generates after 5 seconds
5. Leaderboard tracks wins, streaks, and average response time

### Concurrency Handling
- Node.js is single-threaded — the `isLocked` flag check + set is atomic within one event loop tick
- **Server timestamps** every submission on arrival, neutralizing network latency differences
- Stale question IDs are rejected to prevent race conditions from delayed requests

### Dynamic Question Generation
- `QuestionGenerator` class produces random math problems across difficulty tiers (easy → medium → hard)
- Difficulty auto-scales every 5 questions
- Operations: addition, subtraction, multiplication, division, squares, modulo

### Network Fairness
- Answer timing is measured server-side (`Date.now()` on the server, not the client)
- WebSocket transport ensures minimal overhead compared to HTTP polling
- Falls back to HTTP long-polling if WebSocket isn't available

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Backend
```bash
cd backend
npm install
npm run dev    # starts on http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:3000
```

## API Endpoints

| Method | Endpoint                  | Description             |
|--------|---------------------------|-------------------------|
| GET    | `/api/quiz/question`      | Get current question    |
| POST   | `/api/quiz/answer`        | Submit an answer        |
| POST   | `/api/quiz/register`      | Register a user         |
| GET    | `/api/quiz/leaderboard`   | Get top scores          |
| GET    | `/api/quiz/user/:userId`  | Get user's score        |
| GET    | `/api/quiz/history`       | Get question history    |
| GET    | `/api/quiz/status`        | Get quiz status         |
| GET    | `/api/health`             | Health check            |

### WebSocket Events

| Event (Client → Server) | Payload                                        |
|--------------------------|------------------------------------------------|
| `join`                   | `{ userId, username }`                         |
| `submit_answer`          | `{ userId, username, answer, questionId }`     |

| Event (Server → Client)  | Description                           |
|---------------------------|---------------------------------------|
| `current_question`        | Sent on join — current quiz state     |
| `new_question`            | New round started                     |
| `question_solved`         | Someone solved it — includes winner   |
| `answer_result`           | Result of your submission             |
| `user_count`              | Updated online user count             |

## Tech Stack

- **Backend:** Express, Socket.IO, UUID — chosen for fast real-time bidirectional communication
- **Frontend:** Next.js 16, Tailwind CSS, Socket.IO Client — chosen for rapid UI development with SSR support
- **Storage:** In-memory (Map/Object) — no database needed per requirements

## Corners Cut (Production Notes)

- **No persistent storage** — in-memory data is lost on restart. Production: use Redis or a database.
- **No authentication** — users self-identify with a UUID + name. Production: add OAuth / JWT.
- **No rate limiting** — a user could spam answers. Production: add per-user rate limiting middleware.
- **No input sanitization** — basic validation only. Production: add XSS protection and stricter validation.
- **Single-server only** — the in-memory lock pattern doesn't work across multiple server instances. Production: use Redis pub/sub + distributed locking.
