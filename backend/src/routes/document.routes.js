const express = require("express");
const router = express.Router();
const { getDocument, saveDocument } = require("../controllers/document.controller");

router.get("/documents/:id", getDocument);
router.post("/documents/:id", saveDocument);

module.exports = router;