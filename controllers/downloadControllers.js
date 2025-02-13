const youtubedl = require("youtube-dl-exec");

const downloadMedia = async (req, res) => {
  try {
    const { url, format } = req.query;

    if (!url) {
      return res.status(400).json({ error: "Please provide a YouTube URL" });
    }

    if (!["mp3", "mp4"].includes(format)) {
      return res.status(400).json({ error: "Invalid format. Use 'mp3' for audio or 'mp4' for video." });
    }

    console.log(`Fetching media data for: ${url}`);

    const video = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ["referer:youtube.com", "user-agent:googlebot"],
    });

    console.log("Fetched Video Data:", Object.keys(video));

    if (!video || !video.formats || video.formats.length === 0) {
      throw new Error("No available formats");
    }

    let result = null;

    if (format === "mp3") {
      const bestAudio = video.formats.find(
        (f) => f.resolution === "audio only" && f.ext === "m4a"
      );

      if (!bestAudio) {
        throw new Error("No suitable audio format found");
      }

      result = {
        type: "audio",
        format: bestAudio.ext,
        url: bestAudio.url,
        title: video.title,
        thumbnail: video.thumbnail,
      };
    } else {
      const bestVideo = video.formats.find(
        (f) => f.ext === "mp4" && f.acodec !== "none"
      );

      if (!bestVideo) {
        throw new Error("No suitable video format found");
      }

      result = {
        type: "video",
        format: bestVideo.ext,
        url: bestVideo.url,
        title: video.title,
        thumbnail: video.thumbnail,
      };
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching media data:", error);
    res.status(500).json({
      error: "Failed to fetch media data",
      details: error.message || "No additional details available",
    });
  }
};

export { downloadMedia };
