import { UrbackupServer } from "urbackup-server-api";

import getServiceWidget from "utils/config/service-helpers";

export default async function urbackupProxyHandler(req, res) {
  const { group, service, index } = req.query;
  const serviceWidget = await getServiceWidget(group, service, index);

  const server = new UrbackupServer({
    url: serviceWidget.url,
    username: serviceWidget.username,
    password: serviceWidget.password,
  });

  await (async () => {
    try {
      const allClients = await server.getStatus({ includeRemoved: false });
      let diskUsage = false;
      if (serviceWidget.fields?.includes("totalUsed")) {
        diskUsage = await server.getUsage();
      }
      res.status(200).send({
        clientStatuses: allClients,
        diskUsage,
        maxDays: serviceWidget.maxDays,
      });
    } catch (error) {
      res.status(500).json({ error: "Error communicating with UrBackup server" });
    }
  })();
}
