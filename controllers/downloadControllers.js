const puppeteer = require("puppeteer");
const ytdl = require("@distube/ytdl-core");

let youtubeCookies = ""; // Store cookies dynamically

const getYouTubeCookies = async () => {
  const browser = await puppeteer.launch({ headless: false }); // Open visible browser
  const page = await browser.newPage();

  console.log("👉 Navigating to YouTube...");
  await page.goto("https://www.youtube.com", { waitUntil: "networkidle2" });

  console.log("👉 Please manually log in to YouTube...");
  
  // Wait until login is detected
  while (true) {
    const cookies = await page.cookies();
    const loginCookie = cookies.find(cookie => cookie.name === "LOGIN_INFO");

    if (loginCookie) {
      youtubeCookies = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");
      console.log("\n✅ Login detected! Cookies saved successfully!");
      break;
    }

    console.log("⏳ Waiting for login...");
    await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
  }

  await browser.close();
};

const downloadMedia = async (req, res) => {
  if (!youtubeCookies) {
    await getYouTubeCookies(); // Get cookies if not already set
  }

  const videoUrl = req.query.url;

  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    const options = {
      requestOptions: {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Cookie": youtubeCookies, // Use stored cookies
        },
      },
    };

    const info = await ytdl.getInfo(videoUrl, options);
    const videoFormat = ytdl.chooseFormat(info.formats, { quality: "highestvideo" });
    const audioFormat = ytdl.chooseFormat(info.formats, { filter: "audioonly" });

    if (!videoFormat?.url || !audioFormat?.url) {
      return res.status(500).json({ error: "No valid download links found" });
    }

    res.json({
      success: true,
      video: {
        url: videoFormat.url,
        format: videoFormat.mimeType,
        quality: videoFormat.qualityLabel,
      },
      audio: {
        url: audioFormat.url,
        format: audioFormat.mimeType,
        quality: "Audio Only",
      },
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ error: "Failed to fetch media details" });
  }
};

module.exports = { downloadMedia };
