const { exec } = require("youtube-dl-exec");

const downloadMedia = async (req, res) => {
  const { url, format } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const isAudio = format === "mp3";
  const fileExtension = isAudio ? "mp3" : "mp4";
  const contentType = isAudio ? "audio/mpeg" : "video/mp4";

  try {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="download.${fileExtension}"`
    );
    res.setHeader("Content-Type", contentType);

    exec(url, {
      format: isAudio ? "bestaudio" : "bestvideo+bestaudio",
      output: "-",
      externalDownloader: "aria2c",
      externalDownloaderArgs: ["-x16", "-s16", "-k1M"],
    }).stdout.pipe(res);
  } catch (error) {
    res.status(500).json({ error: "Download failed", details: error.message });
  }
};

module.exports = { downloadMedia };
