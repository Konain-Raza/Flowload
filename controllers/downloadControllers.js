const axios = require("axios");
const yts = require("yt-search");

function getYouTubeVideoId(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/|user\/[^\/\n\s]+\/)?|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

const downloadMedia = async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: "YouTube URL is required" });
  }

  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    const searchResult = await yts({ videoId });
    if (!searchResult || !searchResult.title) {
      return res.status(404).json({ error: "Video not found" });
    }

    console.log(`Downloading "${searchResult.title}"...`);

    const metadata = {
      title: searchResult.title,
      author: searchResult.author.name,
      duration: searchResult.duration.timestamp,
      views: searchResult.views,
      description: searchResult.description,
      thumbnail: searchResult.thumbnail,
    };

    const qualities = {
      audio: 128,
      video: 720,
    };

    const fetchDownloadUrl = async (quality) => {
      try {
        const response = await axios.get(
          `https://ytdl.vreden.web.id/convert.php/${videoId}/${quality}`,
          { timeout: 50000 } // 5 seconds timeout for the initial conversion request
        );

        if (!response.data || !response.data.convert) {
          throw new Error("Failed to start conversion");
        }

        let retries = 0;
        const maxRetries = 10; // Max retries: 10
        const delay = 2000; // 2 seconds delay
        const totalTimeout = maxRetries * delay; // 20 seconds max wait

        const startTime = Date.now();

        while (retries < maxRetries) {
          if (Date.now() - startTime > totalTimeout) {
            throw new Error("Conversion timed out");
          }

          const progress = await axios.get(
            `https://ytdl.vreden.web.id/progress.php/${response.data.convert}`,
            { timeout: 50000 } // 3 seconds timeout for each progress check
          );

          if (progress.data.status === "Error") {
            throw new Error("Conversion failed");
          }

          if (progress.data.status === "Finished") {
            return progress.data.url;
          }

          await new Promise((resolve) => setTimeout(resolve, delay));
          retries++;
        }

        throw new Error("Conversion timed out");
      } catch (error) {
        console.error("Error fetching download URL:", error.message);
        throw error;
      }
    };

    const [audioUrl, videoUrlDownload] = await Promise.all([
      fetchDownloadUrl(qualities.audio),
      fetchDownloadUrl(qualities.video),
    ]);

    res.json({
      status: true,
      metadata,
      downloads: {
        audio: {
          url: audioUrl,
          format: "mp3",
          quality: `${qualities.audio}kbps`,
        },
        video: {
          url: videoUrlDownload,
          format: "mp4",
          quality: `${qualities.video}p`,
        },
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: error.message || "Failed to process media" });
  }
};

module.exports = { downloadMedia };
