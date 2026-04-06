const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }  // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("Document", documentSchema);