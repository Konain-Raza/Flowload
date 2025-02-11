const express = require("express");
const router = express.Router();
const { downloadMedia, searchYouTube } = require("../controllers/downloadControllers.js");

router.get("/download", downloadMedia);
router.get("/search", searchYouTube);

module.exports = router;
