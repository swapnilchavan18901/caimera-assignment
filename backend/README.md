# Math Quiz Backend (TypeScript)

A real-time competitive math quiz game backend built with TypeScript, Express, and Socket.IO.

## Tech Stack

- **TypeScript** - Type-safe JavaScript with `.ts` file imports
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **tsx** - TypeScript execution engine (ts-node alternative)
- **UUID** - Unique ID generation

## Project Structure

```
backend/
├── src/
│   ├── classes/
│   │   ├── QuestionGenerator.ts  # Generates random math questions
│   │   ├── ScoreTracker.ts       # Tracks user scores & leaderboard
│   │   └── QuizManager.ts        # Core game logic & state management
│   ├── controllers/
│   │   └── quizController.ts     # HTTP request handlers
│   ├── routes/
│   │   └── quizRoutes.ts         # API route definitions
│   └── server.ts                 # Main entry point
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies & scripts
```

## Setup

### Install Dependencies

```bash
npm install
```

### Development Scripts

```bash
# Run in development mode with auto-reload
npm run dev

# Run in production mode (no build needed, uses tsx)
npm start

# Type-check without running
npm run typecheck
```

## Key Configuration

### TypeScript with `.ts` Extensions

This project uses **native `.ts` file imports** with `tsx`:

```typescript
import QuizManager from './classes/QuizManager.ts';
import { Request, Response } from 'express';
```

- All imports use `.ts` extensions (not `.js`)
- Uses `tsx` for direct TypeScript execution (no compilation step needed)
- `allowImportingTsExtensions: true` in tsconfig.json
- Faster development with hot reload via `tsx watch`

## API Endpoints

### REST API

- `GET /api/health` - Health check
- `GET /api/quiz/leaderboard?limit=10` - Get top players

### Socket.IO Events

**Client → Server:**
- `join` - Join the game with userId and username
- `submit_answer` - Submit an answer to the current question

**Server → Client:**
- `current_question` - Current question state (on join)
- `new_question` - New question broadcast to all
- `question_solved` - Someone answered correctly
- `answer_result` - Result of your submission
- `user_count` - Updated user count

## Environment Variables

```bash
PORT=4000                              # Server port
FRONTEND_URL=http://localhost:3000     # CORS origin
```

## TypeScript Features

- **Strict Type Checking** - Full type safety enabled
- **Interface Definitions** - All data structures typed
- **ES Modules** - Modern import/export syntax
- **Native `.ts` imports** - Direct TypeScript execution with tsx

## Concurrency Model

The game uses Node.js's single-threaded event loop for atomic operations:
- Server timestamps all answers to eliminate network latency advantages
- First correct answer locks the round (no race conditions)
- Questions auto-rotate every 5 seconds after someone wins
