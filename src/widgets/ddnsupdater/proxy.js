import * as cheerio from "cheerio";

import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import { formatApiCall } from "utils/proxy/api-helpers";
import widgets from "widgets/widgets";


const logger = createLogger("ddnsupdaterProxyHandler");

function processDDNSUpdaterHTMLData(htmlData, widget) {
  var data = {}
  
  try {
    // Parse Data from html
    const $ = cheerio.load(htmlData);
    
    const domains = $("tbody tr")
    .map((_, row) => {
      const cells = $(row).find("td");
      
      return {
        domain: $(cells[0]).text().trim(),
        owner: $(cells[1]).text().trim(),
        provider: $(cells[2]).text().trim(),
        ipVersion: $(cells[3]).text().trim(),
        updateStatus: $(cells[4]).text().trim(),
        currentIP: $(cells[5]).text().trim(),
        previousIPs: $(cells[6]).text().trim(),
      };
    })
    .get();
    
    // Filter for the specified domain

    const filterDomain = widget.domain;
    
    const domainHitList = domains.filter(value => value.domain === filterDomain)
    if(domainHitList.length <= 0){
      return {error: `No Domain in requested URL fits the configured domain: ${filterDomain}`}
    }
    
    const domainHit = domainHitList[0]; // Singular Domain
    
    // Adjust data with RegEx

    const status = domainHit.updateStatus.match(/^(Success|Failure|Up to date|Updating|Unset|Unknown status)/)?.[1] ?? null;
    const timeSinceLastUpdate = domainHit.updateStatus.match(/(\d+h\d+m\d+s) ago/)?.[1] ?? null;
    const previousIP = domainHit.previousIPs.match(/(\d+\.\d+\.\d+\.\d+)/)?.[1] ?? null;
    
    data = {
      domain: domainHit.domain,
      owner: domainHit.owner,
      provider: domainHit.provider,
      ipVersion: domainHit.ipVersion,
      status: status,
      timeSinceLastUpdate: timeSinceLastUpdate,
      currentIP: domainHit.currentIP, 
      previousIP: previousIP
    }
  } catch (error) {
    return {error: error.message}
  }

  return data;
}


export default async function ddnsupdaterProxyHandler(req, res, map) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget || !widgets?.[widget.type]?.api) {
    logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
    return res.status(403).json({ error: "Service does not support API calls" });
  }


  const url = new URL(formatApiCall(widgets[widget.type].api, {...widget}));

  // Get data from url source
  const [status, contentType, htmlData] = await httpProxy(url, { method: req.method });

  if (status === 204 || status === 304) {
    return res.status(status).end();
  }

  if (status !== 200) {
    logger.error(
      "Error getting data from DDNS-Updater for service '%s' in group '%s': %d.  Data: %s",
      service,
      group,
      status,
      htmlData,
    );
    return res.status(status).send({ error: { message: "Error calling DDNS-Updater URL.", htmlData } });
  }

  const data = processDDNSUpdaterHTMLData(htmlData, widget);
  if (data.error) {
    logger.error("Error processing DDNS-Updater data: %s", data.error);
    return res.status(500).json({ error: data.error });
  }

  res.setHeader("Content-Type", "application/json");
  return res.status(status).send(data);
}