const express = require("express");
const cors = require("cors");
const testRoutes = require("./routes/test.routes.js");
const documentRoutes = require("./routes/document.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", testRoutes);
// add this line before your other routes
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});
app.use("/api", documentRoutes); 

module.exports = app;