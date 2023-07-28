// suppress a false positive - this is in package.json
// eslint-disable-next-line import/no-extraneous-dependencies
import {UrbackupServer} from "urbackup-server-api";

import getServiceWidget from "utils/config/service-helpers";

export default async function urbackupProxyHandler(req, res) {
  const {group, service} = req.query;
  const serviceWidget = await getServiceWidget(group, service);

  const server = new UrbackupServer({
    url: serviceWidget.url,
    username: serviceWidget.username,
    password: serviceWidget.password
  });

await (async () => {
    try {
      const allClients = await server.getStatus({includeRemoved: false});
      res.status(200).send({
        data: allClients,
        maxDays: serviceWidget.maxDays
      });
    } catch (error) {
      res.status(500).json({ error: "Something Broke" })
    }
  })();


}
