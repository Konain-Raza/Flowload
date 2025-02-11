const { search, ytmp3, ytmp4 } = require('@vreden/youtube_scraper');

const downloadMedia = async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: "Missing 'url' parameter." });
  }

  try {
    const mp3Info = await ytmp3(videoUrl, "128");
    const mp4Info = await ytmp4(videoUrl);

    if (!mp3Info.status || !mp4Info.status) {
      return res.status(500).json({ error: "Failed to retrieve media details." });
    }

    res.json({
      mp3: { download: mp3Info.download, metadata: mp3Info.metadata },
      mp4: { download: mp4Info.download, metadata: mp4Info.metadata }
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ error: "Failed to fetch media details." });
  }
};

const searchYouTube = async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Missing 'q' parameter." });
  }

  try {
    const result = await search(query);

    if (!result.status) {
      return res.status(500).json({ error: result.result });
    }

    res.json({ results: result.results });
  } catch (error) {
    console.error("Error searching YouTube:", error);
    res.status(500).json({ error: "Failed to fetch search results." });
  }
};

module.exports = { downloadMedia, searchYouTube };
