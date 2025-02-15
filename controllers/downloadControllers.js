const { savefrom } = require("@bochilteam/scraper-savefrom");

const downloadMedia = async (req, res) => {
  const videoUrl = req.query.url;

  try {
    const data = await savefrom(videoUrl);
    console.log(data);

    const videoFormats = data[0].url
      ? data[0].url.filter(
          (item) => item.ext === "mp4" && item.url.includes("google")
        )
      : [];

    const audioFormats = data[0].url
      ? data[0].url.filter(
          (item) =>
            (item.ext === "m4a" || item.ext === "mp3") &&
            item.url.includes("google")
        )
      : [];

    res.json({
      success: true,
      metadata: {
        thumbnail: data[0].thumb,
        title: data[0].meta.title,
      },
      video: videoFormats.length > 0 ? videoFormats : "No video formats found",
      audio: audioFormats.length > 0 ? audioFormats : "No audio formats found",
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ error: "Failed to fetch media details" });
  }
};

module.exports = { downloadMedia };
