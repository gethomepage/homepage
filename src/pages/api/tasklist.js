import { tasklistResponse } from "utils/config/api-response";

export default async function handler(req, res) {
  res.send(await tasklistResponse());
}
