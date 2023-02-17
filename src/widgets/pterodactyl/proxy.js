
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const proxyName = "pterodactylProxyHandler";

const logger = createLogger(proxyName);

export default async function pterodactylProxyHandler(req, res) {
  const { group, service } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (widget) {

      const { url } = widget;

      const nodesURL = `${url}/api/application/nodes?include=servers`;

      let [status, contentType, data] = await httpProxy(nodesURL, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${widget.key}`
        },
      });

      if (status !== 200) {
        logger.error("Unable to retrieve Pterodactyl nodes' list");
        return res.status(status).json({error: {message: `HTTP Error ${status}`, url: nodesURL, data}});
      }

      const nodesData = JSON.parse(data);
      const nodesTotal = nodesData.data.length;
      let nodesOnline = 0;
      let total = 0;

      const serversRequests = [];
      const nodesRequests = [];

      for (let nodeid = 0; nodeid < nodesData.data.length; nodeid += 1) {
        // check if node is online
        const nodeURL = `${nodesData.data[nodeid].attributes.scheme}://${nodesData.data[nodeid].attributes.fqdn}:${nodesData.data[nodeid].attributes.daemon_listen}/api/system`;

        nodesRequests.push(httpProxy(nodeURL));

        for (let serverid = 0; serverid < nodesData.data[nodeid].attributes.relationships.servers.data.length; serverid += 1) {
          total += 1;
          const serverURL = `${url}/api/client/servers/${nodesData.data[nodeid].attributes.relationships.servers.data[serverid].attributes.identifier}/resources`;
          serversRequests.push(httpProxy(serverURL, {
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${widget.key}`
            },
          }));
        }
      }

      const nodesList = await Promise.all(nodesRequests);

      for (let nodeid = 0; nodeid < nodesList.length; nodeid += 1) {
        // eslint-disable-next-line no-unused-vars
        [status, contentType, data] = nodesList[nodeid];
        if (status === 401) {
          nodesOnline += 1;
        }
      }

      let online = 0;

      const serversList = await Promise.all(serversRequests);
      for (let serverid = 0; serverid < serversList.length; serverid += 1) {
        // eslint-disable-next-line no-unused-vars
        [status, contentType, data] = serversList[serverid];
        if (status === 200) {
          const serverData = JSON.parse(data);
          if (serverData.attributes.current_state === "running") {
            online += 1;
          }
        }
      }

      const servers = `${online}/${total}`;
      const nodes = `${nodesOnline}/${nodesTotal}`;

      return res.send(JSON.stringify({
        nodes,
        servers
      }));
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
