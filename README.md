# Real-Time Chat System

Backend for a real-time chat app — course project built with **Node.js**, **Express**, **MongoDB**, and **Socket.IO**.

Users can register, log in, start private chats, send messages via REST API, and receive them instantly over WebSockets.

**Features:** JWT auth · direct messaging · message history · real-time updates · online status

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Required in `.env`: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`

## API

| Method | Endpoint                          | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| POST   | `/api/auth/register`              | Register                       |
| POST   | `/api/auth/login`                 | Login                          |
| GET    | `/api/auth/me`                    | Current user                   |
| GET    | `/api/users`                      | List users                     |
| GET    | `/api/conversations`              | My chats                       |
| POST   | `/api/conversations`              | Start chat `{ participantId }` |
| GET    | `/api/conversations/:id/messages` | Get messages                   |
| POST   | `/api/conversations/:id/messages` | Send `{ content }`             |

Protected routes: `Authorization: Bearer <token>`

## Socket.IO

```javascript
const socket = io("http://localhost:5000", { auth: { token: "JWT" } });
socket.emit("join_conversation", conversationId);
socket.emit("send_message", { conversationId, content });
socket.on("new_message", ({ message }) => {
  /* ... */
});
```

Events: `join_conversation` · `send_message` · `new_message` · `user_online` · `user_offline`
