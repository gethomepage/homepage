import RuTorrent from "rutorrent-promise";

// TODO: Remove the 3rd party dependency once I figure out how to
// call this myself with fetch.  Just need to destruct the package.

export default async function handler(req, res) {
  const { url, username, password } = req.query;

  const constructedUrl = new URL(url);

  const rutorrent = new RuTorrent({
    host: constructedUrl.hostname, // default: localhost
    port: constructedUrl.port, // default: 80
    path: constructedUrl.pathname, // default: /rutorrent
    ssl: constructedUrl.protocol === "https:", // default: false
    username: username, // default: none
    password: password, // default: none
  });

  const data = await rutorrent.get(["d.get_down_rate", "d.get_up_rate", "d.get_state"]);

  res.status(200).send(data);
}
