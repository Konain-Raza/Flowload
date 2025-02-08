const { exec } = require("child_process");

const downloadMedia = async (req, res) => {
  const { url, format } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required" });
  if (!format || !["mp3", "mp4"].includes(format))
    return res.status(400).json({ error: "Format must be 'mp3' or 'mp4'" });

  try {
    const outputFormat = format === "mp3" ? "bestaudio" : "bestvideo+bestaudio";
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="download.${format}"`
    );
    res.setHeader("Content-Type", format === "mp3" ? "audio/mpeg" : "video/mp4");

    const process = exec(`yt-dlp -f "${outputFormat}" -o - "${url}"`);

    process.stdout.pipe(res);

    process.on("error", (err) => {
      console.error("Download error:", err);
      res.status(500).json({ error: "Download failed", details: err.message });
    });

    process.on("close", (code) => {
      if (code !== 0) {
        res.status(500).json({ error: "Download failed", details: `Process exited with code ${code}` });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Download failed", details: error.message });
  }
};

module.exports = { downloadMedia };
