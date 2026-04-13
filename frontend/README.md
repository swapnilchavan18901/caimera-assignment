# Math Quiz Frontend (Next.js)

Real-time competitive math quiz frontend built with Next.js, React, and Socket.IO.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Socket.IO Client** - Real-time WebSocket communication
- **UUID** - User identification

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main quiz interface
│   │   ├── layout.tsx         # Root layout with global styles
│   │   └── globals.css        # Global styles & Tailwind
│   ├── components/
│   │   ├── QuestionCard.tsx   # Question display & answer input
│   │   ├── Leaderboard.tsx    # Top players display
│   │   └── StatusBar.tsx      # Connection & user count
│   └── hooks/
│       └── useSocket.ts       # Socket.IO hook & event handling
└── package.json
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

## Key Features

### Real-Time Communication
- WebSocket-only transport for minimal latency
- Automatic reconnection handling
- Event-driven architecture

### User Management
- Persistent userId stored in localStorage
- Username selection on first visit
- No authentication required

### Socket.IO Events

**Listening (Server → Client):**
- `connect` - Connection established
- `disconnect` - Connection lost
- `current_question` - Initial question state on join
- `new_question` - New question broadcast to all users
- `question_solved` - Someone answered correctly
- `answer_result` - Individual answer feedback
- `user_count` - Updated online user count

**Emitting (Client → Server):**
- `join` - Join game with userId and username
- `submit_answer` - Submit answer to current question

## Components

### `useSocket` Hook
Custom React hook managing all Socket.IO logic, state, and event handlers.

### `QuestionCard`
Displays current question, handles answer submission, shows winner status and feedback.

### `StatusBar`
Shows connection status, username, and online user count.

### `Leaderboard`
Fetches and displays top players from REST API endpoint.

## Styling

- **Tailwind CSS** for utility-first styling
- **Dark theme** with indigo accent colors
- **Responsive design** for mobile and desktop
- **Smooth animations** for state transitions
