const jobs = new Map(); 

const startDownload = async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: "YouTube URL is required" });

  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL" });

  const jobId = `${videoId}-${Date.now()}`;
  jobs.set(jobId, { status: "processing" });

  processDownload(videoId, jobId);
  
  res.json({ jobId, status: "processing" });
};

const processDownload = async (videoId, jobId) => {
  try {
    const searchResult = await yts({ videoId });
    if (!searchResult) throw new Error("Video not found");

    const qualities = { audio: 128, video: 720 };

    const fetchDownloadUrl = async (quality) => {
      const response = await axios.get(`https://ytdl.vreden.web.id/convert.php/${videoId}/${quality}`);
      if (!response.data?.convert) throw new Error("Failed to start conversion");

      let retries = 0;
      while (retries < 10) {
        const progress = await axios.get(`https://ytdl.vreden.web.id/progress.php/${response.data.convert}`);
        if (progress.data.status === "Finished") return progress.data.url;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        retries++;
      }
      throw new Error("Conversion timed out");
    };

    const [audioUrl, videoUrl] = await Promise.all([
      fetchDownloadUrl(qualities.audio),
      fetchDownloadUrl(qualities.video),
    ]);

    jobs.set(jobId, { status: "finished", audioUrl, videoUrl });
  } catch (error) {
    jobs.set(jobId, { status: "error", error: error.message });
  }
};

const checkJobStatus = (req, res) => {
  const { jobId } = req.query;
  if (!jobId || !jobs.has(jobId)) return res.status(404).json({ error: "Job not found" });

  res.json(jobs.get(jobId));
};

module.exports = { startDownload, checkJobStatus };
