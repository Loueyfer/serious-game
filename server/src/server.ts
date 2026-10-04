import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes";
import jwt from "jsonwebtoken";
import { registerRoomHandlers } from "./socket/roomHandlers";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Serious Game Backend is connected!",
  });
});

app.use("/api/auth", authRoutes);

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token || typeof token !== "string") {
    return next(new Error("Authentication required"));
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return next(
      new Error("Server authentication configuration error")
    );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string" ||
      typeof decoded.username !== "string"
    ) {
      return next(new Error("Invalid token"));
    }

    socket.data.user = {
      userId: decoded.userId,
      username: decoded.username,
    };

    next();
  } catch {
    return next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  const user = socket.data.user;

  console.log(
    `Authenticated socket connected: ${user.username} (${user.userId}) - ${socket.id}`
  );

  registerRoomHandlers(socket);

  socket.on("disconnect", () => {
    console.log(
      `Socket disconnected: ${user.username} - ${socket.id}`
    );
  });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});