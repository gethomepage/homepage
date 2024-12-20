import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const logger = createLogger("homeassistantProxyHandler");

const defaultQueries = [
  {
    template: "{{ states.person|selectattr('state','equalto','home')|list|length }} / {{ states.person|list|length }}",
    label: "homeassistant.people_home",
  },
  {
    template: "{{ states.light|selectattr('state','equalto','on')|list|length }} / {{ states.light|list|length }}",
    label: "homeassistant.lights_on",
  },
  {
    template: "{{ states.switch|selectattr('state','equalto','on')|list|length }} / {{ states.switch|list|length }}",
    label: "homeassistant.switches_on",
  },
];

function formatOutput(output, data) {
  return output.replace(
    /\{.*?\}/g,
    (match) =>
      match
        .replace(/\{|\}/g, "")
        .split(".")
        .reduce((o, p) => (o ? o[p] : ""), data) ?? "",
  );
}

async function getQuery(query, { url, key }) {
  const headers = { Authorization: `Bearer ${key}` };
  const { state, template, label, value } = query;
  if (state) {
    return {
      result: await httpProxy(new URL(`${url}/api/states/${state}`), {
        headers,
        method: "GET",
      }),
      output: (data) => {
        const jsonData = JSON.parse(data);
        return {
          label: formatOutput(label ?? "{attributes.friendly_name}", jsonData),
          value: formatOutput(value ?? "{state} {attributes.unit_of_measurement}", jsonData),
        };
      },
    };
  }
  if (template) {
    return {
      result: await httpProxy(new URL(`${url}/api/template`), {
        headers,
        method: "POST",
        body: JSON.stringify({ template }),
      }),
      output: (data) => ({ label, value: data.toString() }),
    };
  }
  return { result: [500, null, { error: { message: `invalid query ${JSON.stringify(query)}` } }] };
}

export default async function homeassistantProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);
  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  let queries = defaultQueries;
  if (!widget.fields && widget.custom) {
    if (typeof widget.custom === "string") {
      try {
        widget.custom = JSON.parse(widget.custom);
      } catch (error) {
        logger.debug("Error parsing HASS widget custom label: %s", JSON.stringify(error));
        return res.status(400).json({ error: "Error parsing widget custom label" });
      }
    }
    queries = widget.custom.slice(0, 4);
  }

  const results = await Promise.all(queries.map((q) => getQuery(q, widget)));

  const err = results.find((r) => r.result[2]?.error);
  if (err) {
    const [status, , data] = err.result;
    return res.status(status).send(data);
  }

  return res.status(200).send(
    results.map((r) => {
      const [status, , data] = r.result;
      return status === 200 ? r.output(data) : { label: status, value: data.toString() };
    }),
  );
}
