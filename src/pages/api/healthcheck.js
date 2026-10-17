import { withAllowedHost } from "utils/auth";

function handler(req, res) {
  res.send("up");
}

export default withAllowedHost(handler);
