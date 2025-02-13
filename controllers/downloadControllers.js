const { ytmp3, ytmp4 } = require("@vreden/youtube_scraper");

const downloadMedia = async (req, res) => {
  try {
    const { url, format } = req.query;

    if (!url) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    if (!["mp3", "mp4"].includes(format)) {
      return res.status(400).json({ error: "Invalid format. Use 'mp3' or 'mp4'." });
    }

    const downloadFunction = format === "mp3" ? ytmp3 : ytmp4;
    const result = await downloadFunction(url);

    if (!result.status || !result.download) {
      return res.status(400).json({ error: "Failed to process media. Please try again." });
    }

    res.json({
      status: true,
      metadata: result.metadata,
      download: {
        url: result.download,
        format,
        quality: "Best Available",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Internal Server Error. Please try again later." });
  }
};

module.exports = { downloadMedia };
