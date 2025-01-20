import dotenv from "dotenv";
import connectDB from "./db/db";
import { app } from "./app";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { Message } from "./models/messageModel";
import { User } from "./models/userModel";

dotenv.config({
  path: "./.env",
});

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

const userSocketMap = new Map();

// Socket.IO connection handling
io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId as string;
  console.log(`User connected: ${socket.id} - ${userId}`);
  // update user online status
  await User.findByIdAndUpdate(userId, { online: true });

  // Store the socket ID for this user
  userSocketMap.set(userId, socket.id);

  // send ping to client for fetch data when user is online
  io.emit("status_update", { userId: socket.handshake.query.userId });

  // Listen for users joining a chat
  socket.on("join", (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // Listen for messages sent by users
  socket.on("send_message", async (data) => {
    const { sender, receiver, message } = data;

    try {
      // Save the message to the database
      const newMessage = await new Message({
        sender,
        receiver,
        message,
      }).save();

      // Determine room ID and emit message
      const roomId = [sender, receiver].sort().join("_");
      console.log(`Emitting to room: ${roomId}`);
      io.to(roomId).emit("receive_message", newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("typing", (roomId, userId) => {
    socket.to(roomId).emit("is_typing", userId);
  });

  socket.on("stop_typing", (roomId, userId) => {
    socket.to(roomId).emit("stopped_typing", userId);
  });

  // Handle user disconnection
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.id}`);
    // Update user online status
    await User.findByIdAndUpdate(socket.handshake.query.userId, {
      online: false,
      lastActive: new Date(),
    });
    io.emit("status_update", { userId: socket.handshake.query.userId });
    userSocketMap.delete(userId);
  });
});

// Start the server
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    server.on("error", (error) => {
      console.error(`Server error: ${error}`);
    });
  })
  .catch((err: Error) => console.error(`MongoDB connection error: ${err}`));
