const express = require("express");
const router = express.Router();
const { getCanvas, saveCanvas } = require("../controllers/canvas.controller");

router.get("/canvas/:id",  getCanvas);
router.post("/canvas/:id", saveCanvas);

module.exports = router;