# Backend Server - Collaborative Drawing App

Backend server for the collaborative drawing application with real-time synchronization using Socket.IO.

## Features

- **Real-time collaboration** with Socket.IO
- **Automatic user association** by selected drawing
- **Room-based architecture** for different drawings
- **User management** with unique colors
- **Drawing synchronization** (strokes, cursor positions)
- **Undo/Clear functionality**
- **REST API** for fetching available drawings
- **CORS enabled** for frontend integration

## Technologies

- Node.js
- Express.js
- Socket.IO
- CORS
- dotenv

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in .env).

## API Endpoints

### REST API

#### GET /drawings
Returns the list of available drawings from `/frontend/public/drawings`.

**Response:**
```json
[
  {
    "id": "drawing-name",
    "name": "Drawing Name",
    "url": "/drawings/drawing-name.svg"
  }
]
```

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "rooms": 2
}
```

## Socket.IO Events

### Client → Server

#### `join-drawing`
Join a drawing room.
```javascript
socket.emit('join-drawing', {
  drawingId: 'drawing-id',
  username: 'User Name'
});
```

#### `draw-stroke`
Send a drawing stroke.
```javascript
socket.emit('draw-stroke', {
  drawingId: 'drawing-id',
  stroke: {
    points: [{x, y}, ...],
    color: '#FF0000',
    width: 2
  }
});
```

#### `cursor-move`
Update cursor position.
```javascript
socket.emit('cursor-move', {
  drawingId: 'drawing-id',
  x: 100,
  y: 200
});
```

#### `undo-stroke`
Undo the last stroke by this user.
```javascript
socket.emit('undo-stroke', {
  drawingId: 'drawing-id'
});
```

#### `clear-canvas`
Clear all strokes (admin/all users).
```javascript
socket.emit('clear-canvas', {
  drawingId: 'drawing-id'
});
```

### Server → Client

#### `room-state`
Received when joining a room, contains current users and strokes.
```javascript
socket.on('room-state', ({ users, strokes }) => {
  // Update local state
});
```

#### `user-joined`
Notification when a new user joins.
```javascript
socket.on('user-joined', (user) => {
  // user: { id, username, color }
});
```

#### `user-left`
Notification when a user leaves.
```javascript
socket.on('user-left', ({ userId, username }) => {
  // Remove user from UI
});
```

#### `stroke-drawn`
Receive a stroke from another user.
```javascript
socket.on('stroke-drawn', (stroke) => {
  // stroke: { points, color, width, userId }
});
```

#### `cursor-moved`
Receive cursor position from another user.
```javascript
socket.on('cursor-moved', ({ userId, username, color, x, y }) => {
  // Update cursor display
});
```

#### `stroke-undone`
Notification when a stroke is undone.
```javascript
socket.on('stroke-undone', ({ userId, strokeIndex }) => {
  // Remove stroke from canvas
});
```

#### `canvas-cleared`
Notification when canvas is cleared.
```javascript
socket.on('canvas-cleared', () => {
  // Clear local canvas
});
```

## Architecture

### Room Management
- Each drawing has its own room identified by `drawingId`
- Users are automatically associated with a room when they join a drawing
- Rooms store:
  - List of connected users with their colors
  - History of all strokes
- Empty rooms are automatically deleted

### User Colors
- Users are assigned a color from a predefined palette when joining
- Colors rotate based on the number of users in the room
- Color palette: `['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']`

## Frontend Integration

### Environment Configuration

Create a `.env` file in the **frontend** directory:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

Or for production:
```env
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

### Frontend Socket.IO Client Setup

```javascript
import io from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND_URL);
```

### Fetching Drawings

```javascript
fetch(`${BACKEND_URL}/drawings`)
  .then(res => res.json())
  .then(drawings => {
    // Use drawings list
  });
```

## Development

### Project Structure

```
backend/
├── server.js         # Main server file
├── package.json      # Dependencies and scripts
├── .env.example      # Environment variables template
├── .env              # Your local environment variables (not in git)
└── README.md         # This file
```

### Adding New Features

1. **New Socket Events**: Add event handlers in the `io.on('connection')` block
2. **New REST Endpoints**: Add routes before the Socket.IO setup
3. **Room Data**: Modify the `rooms` object structure as needed

## Deployment

### Environment Variables

Make sure to set these environment variables on your hosting platform:
- `PORT` - Server port (usually provided by the platform)
- `FRONTEND_URL` - Your frontend URL for CORS
- `NODE_ENV` - Set to `production`

### Recommended Platforms
- Heroku
- Railway
- Render
- DigitalOcean App Platform
- AWS Elastic Beanstalk

## Troubleshooting

### CORS Issues
Make sure `FRONTEND_URL` in `.env` matches your frontend's URL exactly (including protocol and port).

### Socket Connection Issues
- Check that the backend is running
- Verify the frontend is using the correct `REACT_APP_BACKEND_URL`
- Check browser console for connection errors

### Drawings Not Loading
- Ensure the `/frontend/public/drawings` directory exists
- Verify SVG files are present in that directory
- Check file permissions

## License

MIT
