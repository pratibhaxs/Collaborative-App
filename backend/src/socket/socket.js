const { Server } = require("socket.io");

const rooms = {};

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // join room
    socket.on("join-room", ({ docId, userName }) => {
      socket.join(docId);
      socket.docId    = docId;
      socket.userName = userName;

      if (!rooms[docId]) rooms[docId] = [];
      rooms[docId].push({ id: socket.id, name: userName });

      io.to(docId).emit("room-users", rooms[docId]);
      socket.to(docId).emit("user-joined", { name: userName });

      console.log(`${userName} joined room: ${docId}`);
    });

    // text sync
    socket.on("send-changes", ({ docId, content }) => {
      socket.to(docId).emit("receive-changes", content);
    });

    // drawing sync
    socket.on("send-shape", ({ docId, shape }) => {
      socket.to(docId).emit("receive-shape", shape);
    });

    // clear canvas
    socket.on("clear-canvas", ({ docId }) => {
      socket.to(docId).emit("canvas-cleared");
    });

    // leave room
    socket.on("leave-room", ({ docId }) => {
      socket.leave(docId);
      if (rooms[docId]) {
        rooms[docId] = rooms[docId].filter(u => u.id !== socket.id);
        io.to(docId).emit("room-users", rooms[docId]);
      }
      socket.to(docId).emit("user-left", { name: socket.userName });
    });

    // disconnect
    socket.on("disconnect", () => {
      const { docId, userName } = socket;
      if (docId && rooms[docId]) {
        rooms[docId] = rooms[docId].filter(u => u.id !== socket.id);
        io.to(docId).emit("room-users", rooms[docId]);
        io.to(docId).emit("user-left", { name: userName });
      }
      console.log(`User disconnected: ${socket.id}`);
    });

  });

  return io;
}

module.exports = initSocket;