import { withAuth } from "utils/auth";
import { bookmarksResponse } from "utils/config/api-response";

async function handler(req, res) {
  res.send(await bookmarksResponse());
}

export default withAuth(handler);
