import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

const getChatId = (user1, user2) => [user1, user2].sort().join("_");

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("chat:join", ({ userId, partnerId }) => {
    const chatId = getChatId(userId, partnerId);

    socket.join(chatId);

    console.log(
      `User ${userId} joined private chat with ${partnerId} (${chatId})`
    );
  });

  socket.on("chat:send", ({ senderId, receiverId, text }) => {
    const chatId = getChatId(senderId, receiverId);

    io.to(chatId).emit("chat:receive", {
      senderId,
      receiverId,
      text,
      attachment: {
        fileUrl: null,
        fileType: null,
      },
      chatId,
      timestamp: new Date().toISOString(),
    });

    console.log(`[${chatId}] ${senderId} → ${receiverId}: ${text}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(process.env.PORT || 8080, () => {
  console.log("Private Chat Socket server running...");
});
