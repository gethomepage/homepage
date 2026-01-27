import createLogger from "utils/logger";

const logger = createLogger("bingWallpaper");

/**
 * Proxy handler for Bing wallpaper API to avoid CORS issues
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  const bingApiUrl = "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US";

  try {
    const response = await fetch(bingApiUrl);

    if (!response.ok) {
      throw new Error(`Bing API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.images || data.images.length === 0) {
      throw new Error("No images returned from Bing API");
    }

    const imageData = data.images[0];
    const urlbase = imageData.urlbase;
    const imageUrl = `https://www.bing.com${urlbase}_UHD.jpg`;

    // Return enriched response
    const result = {
      url: imageUrl,
      title: imageData.title,
      copyright: imageData.copyright,
      copyrightlink: imageData.copyrightlink,
      startdate: imageData.startdate,
      enddate: imageData.enddate,
      fullstartdate: imageData.fullstartdate,
    };

    // Cache for 1 hour since Bing updates daily
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return res.status(200).json(result);
  } catch (error) {
    logger.error("Failed to fetch Bing wallpaper: %s", error.message);
    return res.status(500).json({ error: "Failed to fetch Bing wallpaper" });
  }
}
