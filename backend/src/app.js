const express = require("express");
const cors = require("cors");
const testRoutes = require("./routes/test.routes.js");
const documentRoutes = require("./routes/document.routes");
const canvasRoutes = require("./routes/canvas.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});
app.use("/api", testRoutes);
app.use("/api", canvasRoutes);
app.use("/api", documentRoutes); 

module.exports = app;