import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import { sanitizeErrorURL } from "utils/proxy/api-helpers";

const logger = createLogger("yahooFinanceProxy");

export default async function yahooFinanceProxyHandler(req, res) {
  const { endpoint } = req.query;

  if (endpoint === "quote" && req.query.query) {
    try {
      const query = JSON.parse(req.query.query);
      const { symbol } = query;

      if (symbol) {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
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
