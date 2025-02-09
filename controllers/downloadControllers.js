const ytdl = require("@distube/ytdl-core");

const downloadMedia = async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const videoFormat = ytdl.chooseFormat(info.formats, { quality: "highestvideo" });
    const audioFormat = ytdl.chooseFormat(info.formats, { filter: "audioonly" });

    if (!videoFormat?.url || !audioFormat?.url) {
      return res.status(500).json({ error: "No valid download links found" });
    }

    res.json({
      success: true,
      video: {
        url: videoFormat.url,
        format: videoFormat.mimeType,
        quality: videoFormat.qualityLabel,
      },
      audio: {
        url: audioFormat.url,
        format: audioFormat.mimeType,
        quality: "Audio Only",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch media details" });
  }
};

module.exports = { downloadMedia };
