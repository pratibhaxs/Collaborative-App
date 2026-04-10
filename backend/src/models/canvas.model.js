const mongoose = require("mongoose");

const canvasSchema = new mongoose.Schema(
  {
    documentId: { type: String, required: true, unique: true },
    imageData:  { type: String, default: "" },  // base64 PNG
  },
  { timestamps: true }
);

module.exports = mongoose.model("Canvas", canvasSchema);