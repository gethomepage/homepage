import { tasklistPersist } from "utils/config/api-response";

export default async function handler(req, res) {
  res.send(await tasklistPersist(req.body));
}
