const ytdl = require("@distube/ytdl-core");
const getProxies = require("get-free-https-proxy");
const { Agent } = require("undici");

const downloadMedia = async (req, res) => {
  try {
    const { url, type = "video" } = req.query;

    // Get a free proxy
    const proxies = await getProxies();
    if (!proxies.length) throw new Error("No free proxies found");

    // Select the first available proxy
    const proxyHost = proxies[0].host;
    const proxyPort = proxies[0].port;
    console.log(`Using Proxy: http://${proxyHost}:${proxyPort}`);

    // Create an HTTP client with the proxy
    const client = new Agent({
      connect: {
        host: proxyHost,
        port: proxyPort,
      },
    });

    // Spoof headers to look like a real browser
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://www.youtube.com/",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    // Fetch video info without needing cookies
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers,
        client, // Using `client` instead of `agent`
      },
    });

    const format =
      type === "video"
        ? ytdl.chooseFormat(info.formats, { quality: "highestvideo" })
        : ytdl.chooseFormat(info.formats, { quality: "highestaudio" });

    if (!format?.url) {
      return res.status(400).json({ error: "Invalid format" });
    }

    res.json({ success: true, downloadUrl: format.url });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch video" });
  }
};

module.exports = { downloadMedia };
