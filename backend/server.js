const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Store active rooms and users
const rooms = {}; // { drawingId: { users: [{ id, username, color }], strokes: [] } }

// Route to get available drawings
app.get('/drawings', (req, res) => {
  try {
    const drawingsPath = path.join(__dirname, '../frontend/public/drawings');
    
    if (!fs.existsSync(drawingsPath)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(drawingsPath);
    const drawings = files
      .filter(file => file.endsWith('.svg'))
      .map(file => ({
        id: file.replace('.svg', ''),
        name: file.replace('.svg', '').replace(/-/g, ' '),
        url: `/drawings/${file}`
      }));
    
    res.json(drawings);
  } catch (error) {
    console.error('Error reading drawings:', error);
    res.status(500).json({ error: 'Failed to load drawings' });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: Object.keys(rooms).length });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join a drawing room
  socket.on('join-drawing', ({ drawingId, username }) => {
    // Leave previous room if any
    const previousRoom = Array.from(socket.rooms).find(room => room !== socket.id);
    if (previousRoom) {
      socket.leave(previousRoom);
      removeUserFromRoom(previousRoom, socket.id);
    }
    
    // Join new room
    socket.join(drawingId);
    
    // Initialize room if it doesn't exist
    if (!rooms[drawingId]) {
      rooms[drawingId] = {
        users: [],
        strokes: []
      };
    }
    
    // Assign a random color to the user
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const userColor = colors[rooms[drawingId].users.length % colors.length];
    
    // Add user to room
    const user = {
      id: socket.id,
      username: username || `User${socket.id.substring(0, 4)}`,
      color: userColor
    };
    
    rooms[drawingId].users.push(user);
    
    // Send current room state to the new user
    socket.emit('room-state', {
      users: rooms[drawingId].users,
      strokes: rooms[drawingId].strokes
    });
    
    // Notify other users in the room
    socket.to(drawingId).emit('user-joined', user);
    
    console.log(`${user.username} joined drawing: ${drawingId}`);
  });
  
  // Handle drawing stroke
  socket.on('draw-stroke', ({ drawingId, stroke }) => {
    if (rooms[drawingId]) {
      // Add stroke to room history
      rooms[drawingId].strokes.push({
        ...stroke,
        userId: socket.id,
        timestamp: Date.now()
      });
      
      // Broadcast to all other users in the room
      socket.to(drawingId).emit('stroke-drawn', {
        ...stroke,
        userId: socket.id
      });
    }
  });
  
  // Handle cursor movement
  socket.on('cursor-move', ({ drawingId, x, y }) => {
    if (rooms[drawingId]) {
      const user = rooms[drawingId].users.find(u => u.id === socket.id);
      if (user) {
        socket.to(drawingId).emit('cursor-moved', {
          userId: socket.id,
          username: user.username,
          color: user.color,
          x,
          y
        });
      }
    }
  });
  
  // Handle undo
  socket.on('undo-stroke', ({ drawingId }) => {
    if (rooms[drawingId]) {
      // Find and remove the last stroke by this user
      const userStrokes = rooms[drawingId].strokes
        .map((stroke, index) => ({ stroke, index }))
        .filter(({ stroke }) => stroke.userId === socket.id);
      
      if (userStrokes.length > 0) {
        const lastStroke = userStrokes[userStrokes.length - 1];
        rooms[drawingId].strokes.splice(lastStroke.index, 1);
        
        // Broadcast undo to all users in the room
        io.to(drawingId).emit('stroke-undone', {
          userId: socket.id,
          strokeIndex: lastStroke.index
        });
      }
    }
  });
  
  // Handle clear canvas
  socket.on('clear-canvas', ({ drawingId }) => {
    if (rooms[drawingId]) {
      rooms[drawingId].strokes = [];
      io.to(drawingId).emit('canvas-cleared');
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Find and remove user from all rooms
    Object.keys(rooms).forEach(drawingId => {
      removeUserFromRoom(drawingId, socket.id);
    });
  });
});

// Helper function to remove user from room
function removeUserFromRoom(drawingId, userId) {
  if (rooms[drawingId]) {
    const userIndex = rooms[drawingId].users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      const user = rooms[drawingId].users[userIndex];
      rooms[drawingId].users.splice(userIndex, 1);
      
      // Notify other users
      io.to(drawingId).emit('user-left', { userId, username: user.username });
      
      console.log(`${user.username} left drawing: ${drawingId}`);
      
      // Clean up empty rooms
      if (rooms[drawingId].users.length === 0) {
        delete rooms[drawingId];
        console.log(`Room ${drawingId} deleted (empty)`);
      }
    }
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
