import cachedFetch from "utils/proxy/cached-fetch";
import { getSettings } from "utils/config/config";

export default async function handler(req, res) {
  const { watchlist, provider, cache } = req.query;

  if (!watchlist) {
    return res.status(400).json({ error: "Missing watchlist" });
  }

  const watchlistArr = watchlist.split(",") || [watchlist];

  if (!watchlistArr.length || watchlistArr[0] === "null" || !watchlistArr[0]) {
    return res.status(400).json({ error: "Missing watchlist" });
  }

  if (watchlistArr.length > 8) {
    return res.status(400).json({ error: "Max items in watchlist is 8" });
  }

  const hasDuplicates = new Set(watchlistArr).size !== watchlistArr.length;

  if (hasDuplicates) {
    return res.status(400).json({ error: "Watchlist contains duplicates" });
  }

  if (!provider) {
    return res.status(400).json({ error: "Missing provider" });
  }

  if (provider !== "finnhub" && provider !== "yahoofinance") {
    return res.status(400).json({ error: "Invalid provider" });
  }

  const providersInConfig = getSettings()?.providers;

  // Not all providers require an API key
  let apiKey;
  if (provider === "finnhub") {
    Object.entries(providersInConfig).forEach(([key, val]) => {
      if (key === provider) apiKey = val;
    });

    if (typeof apiKey === "undefined") {
      return res.status(400).json({ error: "Missing or invalid API Key for provider" });
    }
  }

  if (provider === "finnhub") {
    // Finnhub allows up to 30 calls/second
    // https://finnhub.io/docs/api/rate-limit
    const results = await Promise.all(
      watchlistArr.map(async (ticker) => {
        if (!ticker) {
          return { ticker: null, currentPrice: null, percentChange: null };
        }
        // https://finnhub.io/docs/api/quote
        const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;
        // Finnhub free accounts allow up to 60 calls/minute
        // https://finnhub.io/pricing
        const { c, dp } = await cachedFetch(apiUrl, cache || 1);

        // API sometimes returns 200, but values returned are `null`
        if (c === null || dp === null) {
          return { ticker, currentPrice: null, percentChange: null };
        }

        // Rounding percentage, but we want it back to a number for comparison
        return { ticker, currentPrice: c.toFixed(2), percentChange: parseFloat(dp.toFixed(2)) };
      }),
    );

    return res.send({
      stocks: results,
    });
  }

  if (provider === "yahoofinance") {
    const results = await Promise.all(
      watchlistArr.map(async (ticker) => {
        if (!ticker) {
          return { ticker: null, currentPrice: null, percentChange: null };
        }

        // Use the chart endpoint with minimal data points
        const apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period=1d&interval=1d`;
        const { chart } = await cachedFetch(apiUrl, cache || 1);

        // Symbol not found
        if (chart.result === null) {
          return { ticker, currentPrice: null, percentChange: null };
        }

        const price = chart.result[0].meta.regularMarketPrice
        const previousClose = chart.result[0].meta.chartPreviousClose
        const change = previousClose ? ((price - previousClose) / previousClose) * 100 : 0.0

        // Rounding percentage, but we want it back to a number for comparison
        return { ticker, currentPrice: price.toFixed(2), percentChange: change.toFixed(2), currency: chart.result[0].meta.currency };
      }),
    );

    return res.send({
      stocks: results,
    });
  }

  return res.status(400).json({ error: "Invalid configuration" });
}
