import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import { sanitizeErrorURL } from "utils/proxy/api-helpers";

const logger = createLogger("yahooFinanceProxy");

function getIntervalForRange(range) {
  switch (range) {
    case "1h":
      return "1m";
    case "1d":
      return "2m"; // Yahoo defaults to 2m for 1d often
    case "5d":
      return "15m";
    case "1mo":
      return "30m";
    case "3mo":
      return "1d";
    case "6mo":
      return "1d";
    case "1y":
      return "1d";
    case "2y":
      return "1wk";
    case "5y":
      return "1wk";
    case "10y":
      return "1mo";
    case "ytd":
      return "1d";
    case "max":
      return "3mo";
    default:
      return "1d";
  }
}

export default async function yahooFinanceProxyHandler(req, res) {
  const { endpoint } = req.query;

  if (endpoint === "quote" && req.query.query) {
    try {
      const query = JSON.parse(req.query.query);
      const { symbol, range = "1d" } = query;
      const interval = getIntervalForRange(range);

      if (symbol) {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
        const [status, contentType, data] = await httpProxy(url, {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        });

        let resultData = data;
        if (status === 200) {
            // Check for API errors in 200 OK response
            if (resultData && resultData.chart && resultData.chart.error) {
                return res.status(500).json({ error: resultData.chart.error });
            }
        }

        if (contentType) res.setHeader("Content-Type", contentType);
        return res.status(status).send(resultData);
      }
    } catch (e) {
      logger.error("Error parsing query or fetching data: %s", e);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(400).json({ error: "Invalid request" });
}
