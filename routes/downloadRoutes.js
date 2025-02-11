const express = require("express");
const router = express.Router();
const { downloadMedia } = require("../controllers/downloadControllers");

router.get("/download", downloadMedia);

module.exports = router;
