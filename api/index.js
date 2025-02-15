const express = require("express");
const {
  YtdlCore,
  YTDL_VideoInfo,
  YTDL_VideoFormat,
} = require("@ybd-project/ytdl-core/serverless");
const app = express();
const port = 3000; // Local port to run the server

// Middleware to handle CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

// Handler for YouTube Video Info
app.get("/video-info", (req, res) => {
 
  const ytdl = new YtdlCore({
    poToken: "MnRk7Rrtm32v_GTVG9wMCxWvMmaVDFnfK50V7MieLKzyLOZwyw5Ukq4VJNAIjpBn8N3NTsrqbKaIzV7R38nJeq98nNFxEzi78lSZy11qIeyDieHrTl5MueWIx9NUDGLPiCbbnEwD3LajKjBGUYMirmU6MOvJ0w==",
    visitorData: "CgtkOWJXSnZiRWtoSSjA6MK9BjIKCgJQSxIEGgAgWQ%3D%3D",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
    },
    logDisplay: ["debug", "info", "error"],
  });
  // Removed client configuration
  const VIDEO_ID = String(req.query.id); // Ensure it's a string

  if (!VIDEO_ID) {
    return res.status(400).json({
      error: "No video ID provided",
    });
  }

  function errorHandler(err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }

  ytdl
    .getBasicInfo(`https://www.youtube.com/watch?v=${VIDEO_ID}`)
    .then((results) => {
      const filteredFormats =
        results.formats?.filter((format) => format.itag === 18) || [];

      YtdlCore.decipherFormats(filteredFormats, {
        useRetrievedFunctionsFromGithub: true,
      })
        .then(async (formats) => {
          const VIDEO_INFO = {
            ...results,
            formats: YtdlCore.toVideoFormats(formats),
            full: true,
          };

          res.json(VIDEO_INFO);
        })
        .catch(errorHandler);
    })
    .catch(errorHandler);
});

// Start the server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

export default app;
