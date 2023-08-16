import { processReq } from "../../../widgets/openmediavault/proxy";

import { getPrivateWidgetOptions } from "utils/config/widget-helpers";

export default async function handler(req, res) {
  const { index, method } = req.query;
  const [{ options }] = await getPrivateWidgetOptions("openmediavault", index);
  const widget = {
    type: "openmediavault",
    method,
    ...options,
  };

  return processReq(widget, res);
}
