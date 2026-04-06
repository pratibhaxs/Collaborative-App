const { Server } = require("socket.io");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-room", (docId) => {
      socket.join(docId);
      console.log(`User ${socket.id} joined room: ${docId}`);

      socket.to(docId).emit("user-joined", {
        userId: socket.id,
        message: `A new user joined document ${docId}`,
      });
    });

    // receive changes from one user → broadcast to everyone else in room
    socket.on("send-changes", ({ docId, content }) => {
      socket.to(docId).emit("receive-changes", content);  // socket.to() excludes sender
    });

    socket.on("leave-room", (docId) => {
      socket.leave(docId);
      console.log(`User ${socket.id} left room: ${docId}`);

      socket.to(docId).emit("user-left", {
        userId: socket.id,
        message: `A user left document ${docId}`,
      });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initSocket;