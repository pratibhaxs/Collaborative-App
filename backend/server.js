require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const initSocket = require("./src/socket/socket");

const PORT = process.env.PORT || 5000;

// create HTTP server
const server = http.createServer(app);

// initialize socket
initSocket(server);

// connect DB and start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});