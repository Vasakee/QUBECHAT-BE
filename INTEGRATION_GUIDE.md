# Quick Integration Guide

## 1. Install Socket.IO

```bash
npm install socket.io
npm install --save-dev @types/socket.io
```

## 2. Update package.json

Add to devDependencies:
```json
"@nestjs/websockets": "^10.1.2",
```

## 3. Create Missing Schema Exports (schemas/user.schema.ts)

Add this to your `src/schemas/user.schema.ts` if not present:
```typescript
export const UserSchema = SchemaFactory.createForClass(User);
```

## 4. Update main.ts (if needed)

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS setup for WebSocket
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(3000);
}

bootstrap();
```

## 5. Create Frontend Integration (Example - React)

### Install client library
```bash
npm install socket.io-client
```

### Chat Context Hook
```typescript
// hooks/useChatSocket.ts
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useChatSocket = (token: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    socketRef.current = io('http://localhost:3000/chat', {
      auth: { token },
    });

    socketRef.current.on('connected', (data) => {
      console.log('Connected to chat server', data);
      setConnected(true);
    });

    socketRef.current.on('message', (payload) => {
      setMessages((prev) => [...prev, payload]);
    });

    socketRef.current.on('ai-message', (payload) => {
      setMessages((prev) => [...prev, payload]);
    });

    socketRef.current.on('error', (error) => {
      console.error('Chat error:', error);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  const joinRoom = (roomId: string, userName: string) => {
    socketRef.current?.emit('join-room', { roomId, userName });
  };

  const sendMessage = (roomId: string, message: string, chatId?: string) => {
    socketRef.current?.emit('send-message', {
      roomId,
      message,
      chatId,
      isGroupChat: false,
    });
  };

  const sendAIMessage = (
    roomId: string,
    messages: any[],
    courseId?: string,
    chatId?: string
  ) => {
    socketRef.current?.emit('send-ai-message', {
      roomId,
      messages,
      courseId,
      chatId,
    });
  };

  const leaveRoom = (roomId: string) => {
    socketRef.current?.emit('leave-room', { roomId });
  };

  return {
    connected,
    messages,
    joinRoom,
    sendMessage,
    sendAIMessage,
    leaveRoom,
    socket: socketRef.current,
  };
};
```

### Group Chat Component
```typescript
// components/GroupChat.tsx
import { useEffect, useState } from 'react';
import { useChatSocket } from '../hooks/useChatSocket';

export const GroupChat: React.FC<{ groupChatId: string; userName: string }> = ({
  groupChatId,
  userName,
}) => {
  const { connected, messages, joinRoom, sendMessage, leaveRoom } =
    useChatSocket(localStorage.getItem('token') || '');
  const [input, setInput] = useState('');

  useEffect(() => {
    joinRoom(groupChatId, userName);
    return () => leaveRoom(groupChatId);
  }, [groupChatId, userName]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(groupChatId, input, groupChatId);
      setInput('');
    }
  };

  return (
    <div className="group-chat">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.isAI ? 'ai' : 'user'}`}>
            <strong>{msg.userName}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type message..."
        />
        <button onClick={handleSend} disabled={!connected}>
          Send
        </button>
      </div>
    </div>
  );
};
```

### Flashcard Component
```typescript
// components/Flashcard.tsx
import { useState } from 'react';
import { useApi } from '../hooks/useApi';

export const Flashcard: React.FC<{ flashcardId: string }> = ({ flashcardId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { post, get } = useApi();
  const [flashcard, setFlashcard] = useState<any>(null);

  const handleReview = async (difficulty: 'easy' | 'medium' | 'hard') => {
    await post(`/api/v1/flashcards/${flashcardId}/review`, {
      cardIndex: currentIndex,
      difficulty,
    });

    if (currentIndex < flashcard.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      alert('Flashcard set completed!');
    }
  };

  if (!flashcard) return <div>Loading...</div>;

  const card = flashcard.cards[currentIndex];

  return (
    <div className="flashcard-container">
      <div
        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="card-content">
          <h3>{isFlipped ? 'Answer' : 'Question'}</h3>
          <p>{isFlipped ? card.answer : card.question}</p>
        </div>
      </div>

      <div className="controls">
        <button onClick={() => handleReview('hard')}>Hard</button>
        <button onClick={() => handleReview('medium')}>Medium</button>
        <button onClick={() => handleReview('easy')}>Easy</button>
      </div>

      <div className="progress">
        {currentIndex + 1} / {flashcard.cards.length}
      </div>
    </div>
  );
};
```

## 6. Run the Application

```bash
npm run start:dev
```

Server will start on `http://localhost:3000`
WebSocket available at `ws://localhost:3000/chat`

## 7. Test with Curl/Postman

### Create Group Chat
```bash
curl -X POST http://localhost:3000/api/v1/groupchat/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Study Group",
    "creator": "user_id_1",
    "members": ["user_id_1", "user_id_2"],
    "course": "course_id_1"
  }'
```

### Create Flashcard Set
```bash
curl -X POST http://localhost:3000/api/v1/flashcards/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Biology Basics",
    "creator": "user_id",
    "course": "course_id",
    "cards": [
      {
        "question": "What is photosynthesis?",
        "answer": "Process of converting light to chemical energy",
        "difficulty": "medium"
      }
    ]
  }'
```

## Troubleshooting

### WebSocket Connection Issues
- Check CORS settings in main.ts
- Verify JWT token is valid
- Check browser console for connection errors

### Group Chat Not Showing Messages
- Ensure user is a member of the group
- Verify room ID matches chat ID
- Check WebSocket gateway logs

### Flashcard Review Not Updating
- Confirm cardIndex is valid (0-based)
- Check user has permission
- Verify difficulty is: 'easy', 'medium', or 'hard'



