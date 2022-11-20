import RuTorrent from "rutorrent-promise";

import getServiceWidget from "utils/config/service-helpers";

export default async function rutorrentProxyHandler(req, res) {
  const { group, service } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (widget) {
      const constructedUrl = new URL(widget.url);

      let rtPort = constructedUrl.port;
      if (rtPort === '') {
        rtPort = constructedUrl.protocol === "https:" ? 443 : 80;
      }

      const rutorrent = new RuTorrent({
        host: constructedUrl.hostname,
        port: rtPort,
        path: constructedUrl.pathname,
        ssl: constructedUrl.protocol === "https:",
        username: widget.username,
        password: widget.password,
      });

      const data = await rutorrent.get(["d.get_down_rate", "d.get_up_rate", "d.get_state"]);

      return res.status(200).send(data);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
