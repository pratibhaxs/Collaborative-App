const Canvas = require("../models/canvas.model");

const getCanvas = async (req, res) => {
  try {
    const canvas = await Canvas.findOne({ documentId: req.params.id });
    res.json({ success: true, canvas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const saveCanvas = async (req, res) => {
  try {
    const { imageData } = req.body;
    const canvas = await Canvas.findOneAndUpdate(
      { documentId: req.params.id },
      { imageData },
      { new: true, upsert: true }
    );
    res.json({ success: true, canvas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCanvas, saveCanvas };