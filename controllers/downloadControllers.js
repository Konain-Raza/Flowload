const { ytmp3, ytmp4 } = require('@vreden/youtube_scraper');

const downloadMedia = async (req, res) => {
  const videoUrl = req.query.url;
  const format = req.query.format || "mp3";

  try {
    let info;
    if (format === "mp3") {
      info = await ytmp3(videoUrl, "128");
    } else if (format === "mp4") {
      info = await ytmp4(videoUrl);
    } else {
      return res.status(400).json({ error: "Invalid format. Use 'mp3' or 'mp4'." });
    }

    if (!info.status) {
      return res.status(500).json({ error: info.result });
    }

    res.json({ download: info.download, metadata: info.metadata });
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ error: "Failed to fetch media details" });
  }
};

module.exports = { downloadMedia };
