import { Controller } from "node-unifi";

export default async function handler(req, res) {
  const { host, port, username, password } = req.query;

  if (!host) {
    return res.status(400).json({ error: "Missing host" });
  }

  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  if (!password) {
    return res.status(400).json({ error: "Missing password" });
  }

  const controller = new Controller({
    host: host,
    port: port,
    sslverify: false
  });
  
  try {
    //login to the controller
    await controller.login(username, password);
    
    //retrieve sites
    const sites = await controller.getSitesStats();
    const default_site = sites.find(s => s.name == "default");
    const wan = default_site.health.find(h => h.subsystem == "wan");
    const lan = default_site.health.find(h => h.subsystem == "lan");
    const wlan = default_site.health.find(h => h.subsystem == "wlan");

    return res.status(200).json({
      name: wan.gw_name,
      uptime: wan['gw_system-stats']['uptime'],
      up: wan.status == 'ok',
      wlan: {
        users: wlan.num_user,
        status: wlan.status
      },
      lan: {
        users: lan.num_user,
        status: lan.status
      }
    });
  } catch (e) {
    return res.status(400).json({
      error: `Error communicating with UniFi Console: ${e.message}`
    })
  }
}
