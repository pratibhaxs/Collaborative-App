const Document = require("../models/document.model");

// GET /api/documents/:id — load document by documentId
const getDocument = async (req, res) => {
  try {
    const { id } = req.params;

    let document = await Document.findOne({ documentId: id });

    // create empty document if it doesn't exist yet
    if (!document) {
      document = await Document.create({ documentId: id, content: "" });
    }

    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/documents/:id — save/update document content
const saveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const document = await Document.findOneAndUpdate(
      { documentId: id },
      { content },
      { new: true, upsert: true }  // upsert creates if doesn't exist
    );

    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDocument, saveDocument };