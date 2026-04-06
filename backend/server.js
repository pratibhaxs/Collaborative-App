require("dotenv").config();
const http = require("http");          // ← load .env first
const app = require("./src/app");
const initSocket = require("./src/socket/socket");
const connectDB = require("./src/config/db");  // ← add this

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

// connect to MongoDB then start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});