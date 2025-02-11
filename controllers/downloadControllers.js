const ytdl = require("@distube/ytdl-core");
const { HttpsProxyAgent } = require("https-proxy-agent");
const { Agent } = require("undici");
const { search, ytmp3, ytmp4, ytdlv2, channel } = require('@vreden/youtube_scraper');
// Replace with a valid proxy URL
const proxyUrl = "http://45.81.225.94:8080"; 

const proxyAgent = new HttpsProxyAgent(proxyUrl);
const client = new Agent({ connect: { proxy: proxyUrl } });

const options = {
  requestOptions: {
    client, // ✅ Correct usage for undici
  },
};

const downloadMedia = async (req, res) => {
  const videoUrl = req.query.url;

  // if (!videoUrl || !ytdl.validateURL(videoUrl)) {
  //   return res.status(400).json({ error: "Invalid YouTube URL" });
  // }

  try {
    const url = 'https://www.youtube.com/watch?v=xZYTTa5x-xQ&list=RDxZYTTa5x-xQ';

    // quality download, pilih di Quality Available
    const quality = "128"
    
    /* 
     * atau kamu bisa langsung url
     * saja untuk default quality (128)
     * example: ytmp3(url)
    */
    
    const info = await ytmp3(url, quality)
        .then(result => {
            if (result.status) {
                console.log('Download Link:', result.download);
                console.log('Metadata:', result.metadata);
            } else {
                console.error('Error:', result.result);
            }
        });
    res.json({
      info
    })
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ error: "Failed to fetch media details" });
  }
};

module.exports = { downloadMedia };
