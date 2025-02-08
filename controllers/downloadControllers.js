const ytdl = require("@distube/ytdl-core");

const downloadMedia = async (req, res) => {
  const videoUrl = req.query.url;
  const type = req.query.type || "video"; // "audio" or "video"

  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    let format;

    if (type === "video") {
      format = ytdl.chooseFormat(info.formats, { quality: "highestvideo" });
    } else {
      format = ytdl.chooseFormat(info.formats, { filter: "audioonly" });
    }

    if (!format || !format.url) {
      return res.status(500).json({ error: "No valid download link found" });
    }

    res.json({
      success: true,
      downloadUrl: format.url,
      format: format.mimeType,
      quality: format.qualityLabel || "Audio Only",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch video details" });
  }
};

module.exports = { downloadMedia };
