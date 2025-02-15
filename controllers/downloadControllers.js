const youtubedl = require('youtube-dl-exec');

const downloadMedia = async (req, res) => {
  try {
    // 🔹 Test Data (Default YouTube URL if none is provided)
    const videoUrl = req.query.url || "https://www.youtube.com/watch?v=6xKWiCMKKJg";

    // 🔸 Fetch Video Info
    const output = await youtubedl(videoUrl, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    });

    // 🔹 Extract Video & Audio Info
    const videoFormats = output.formats.filter(f => f.vcodec !== 'none' && f.acodec !== 'none');
    const audioFormats = output.formats.filter(f => f.vcodec === 'none' && f.acodec !== 'none');

    // 🔸 Get the Best Video and Audio Format
    const bestVideo = videoFormats[0];
    const bestAudio = audioFormats[0];

    if (!bestVideo || !bestAudio) {
      return res.status(500).json({ error: "No valid download links found" });
    }

    // 🔹 Send Response
    res.json({
      success: true,
      video: {
        url: bestVideo.url,
        format: bestVideo.ext,
        quality: bestVideo.format_note,
      },
      audio: {
        url: bestAudio.url,
        format: bestAudio.ext,
        quality: "Audio Only",
      },
    });

  } catch (error) {
    console.error("❌ Error fetching media:", error);
    res.status(500).json({ error: "Failed to fetch media details" });
  }
};

module.exports = { downloadMedia };
