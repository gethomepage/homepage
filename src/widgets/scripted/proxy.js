import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const logger = createLogger("scriptedProxyHandler");
const { execSync } = require('child_process')

export default async function scriptedProxyHandler(req, res, map) {
  const { group, service, endpoint } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    let output;
    try {
      output = JSON.parse(execSync(widget.script).toString());
    }
    catch (err) {
      return res.status(500).send('script failed: ' + err);
    }

    const fields = widget.fields || Object.keys(output) || [];
    const labels = widget.field_labels || [];
    const types = widget.field_types || [];

    const result = fields.map(field => {
      return {
        name: field, label: labels[field] || field, value: output[field], type: types[field]
      };
    });

    return res.status(200).json(result);
  }

  logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
  return res.status(400).json({ error: "Invalid proxy service type" });
}
