const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();
const server = http.createServer(app);

// Initialize the socket server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],  // Allowing only this URL for CORS
  },
});

// Store the mapping of userId to socketId
const userSocketMap = {};  // {userId: socketId}

// Function to get the receiver's socket ID based on userId
const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Grab the userId from the connection query (when the client connects)
  const userId = socket.handshake.query.userId;
  
  // Only set the socket ID for valid userId
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} is connected with socket ID: ${socket.id}`);
  }

  // Notify all connected users with the list of online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    if (userId) {
      delete userSocketMap[userId];  // Remove from map on disconnection
      io.emit("getOnlineUsers", Object.keys(userSocketMap));  // Notify remaining users
    }
  });
});

// Export server, io, and app
module.exports = { io, app, server };
