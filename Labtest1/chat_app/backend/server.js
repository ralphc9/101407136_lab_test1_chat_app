require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(cors()); 
app.use(express.static(path.join(__dirname, 'frontend')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define Message Schema
const GroupMessageSchema = new mongoose.Schema({
  from_user: String,
  room: String,
  message: String,
  date_sent: { type: Date, default: Date.now }
});

const GroupMessage = mongoose.model('GroupMessage', GroupMessageSchema);

// Routes (for simplicity, not changing these)
app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'chat.html')));

// Socket.io Setup
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Listen for message events and save them to the DB, then broadcast to the room
  socket.on('sendMessage', async ({ from_user, room, message }) => {
    const msg = new GroupMessage({ from_user, room, message });
    await msg.save();
    io.to(room).emit('receiveMessage', msg); // Emit to all clients in the room
  });

  // Handle typing indicator: User starts typing
  socket.on('userTyping', (data) => {
    socket.to(data.room).emit('userTyping', data.user); // Broadcast that user is typing
  });

  // Handle typing indicator: User stops typing
  socket.on('stopTyping', (data) => {
    socket.to(data.room).emit('stopTyping', data.user); // Broadcast that user stopped typing
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(5000, () => console.log('Server running on port 5000'));
