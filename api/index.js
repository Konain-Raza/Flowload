const express = require('express');
const { YtdlCore, YTDL_VideoInfo, YTDL_VideoFormat } = require('@ybd-project/ytdl-core/serverless');
const app = express();
const port = 3000;  // Local port to run the server

// Middleware to handle CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// Handler for YouTube Video Info
app.get('/video-info', (req, res) => {
    const ytdl = new YtdlCore({
        hl: 'en',
        gl: 'US',
        disableDefaultClients: true,
        disablePoTokenAutoGeneration: true,
        disableInitialSetup: true,
        parsesHLSFormat: false,
        noUpdate: true,
        logDisplay: ['warning', 'error'],
        clients: ['mweb', 'web'],
        filter: 'videoandaudio',
        html5Player: {
            useRetrievedFunctionsFromGithub: true,
        },
    });

    const VIDEO_ID = String(req.query.id);  // Ensure it's a string

    if (!VIDEO_ID) {
        return res.status(400).json({
            error: 'No video ID provided',
        });
    }

    function errorHandler(err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        });
    }

    ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${VIDEO_ID}`)
        .then((results) => {
            const filteredFormats = results.formats?.filter((format) => format.itag === 18) || [];

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
export default app;
