import getServiceWidget from "utils/config/service-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";
import { formatApiCall } from "utils/proxy/api-helpers";
import createLogger from "utils/logger";

const logger = createLogger("rutorrentProxyHandler");

// from https://github.com/ctessier/node-rutorrent-promise/blob/next/utils.js
const getTorrentInfo = (data) => ({
  "d.is_open": data[0],
  "d.is_hash_checking": data[1],
  "d.is_hash_checked": data[2],
  "d.get_state": data[3],
  "d.get_name": data[4],
  "d.get_size_bytes": data[5],
  "d.get_completed_chunks": data[6],
  "d.get_size_chunks": data[7],
  "d.get_bytes_done": data[8],
  "d.get_up_total": data[9],
  "d.get_ratio": data[10],
  "d.get_up_rate": data[11],
  "d.get_down_rate": data[12],
  "d.get_chunk_size": data[13],
  "d.get_custom1": data[14],
  "d.get_peers_accounted": data[15],
  "d.get_peers_not_connected": data[16],
  "d.get_peers_connected": data[17],
  "d.get_peers_complete": data[18],
  "d.get_left_bytes": data[19],
  "d.get_priority": data[20],
  "d.get_state_changed": data[21],
  "d.get_skip_total": data[22],
  "d.get_hashing": data[23],
  "d.get_chunks_hashed": data[24],
  "d.get_base_path": data[25],
  "d.get_creation_date": data[26],
  "d.get_tracker_focus": data[27],
  "d.is_active": data[28],
  "d.get_message": data[29],
  "d.get_custom2": data[30],
  "d.get_free_diskspace": data[31],
  "d.is_private": data[32],
  "d.is_multi_file": data[33],
});

export default async function rutorrentProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (widget) {
      const api = widgets?.[widget.type]?.api;
      const url = new URL(formatApiCall(api, { ...widget }));

      const headers = {};
      if (widget.username) {
        headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
      }

      const [status, , data] = await httpProxy(url, {
        method: "POST",
        headers,
        body: "mode=list",
      });

      if (status !== 200) {
        logger.error("HTTP Error %d calling %s", status, url.toString());
        return res.status(status).json({ error: { message: "HTTP Error", url, data } });
      }

      try {
        const rawData = JSON.parse(data);
        const parsedData = Object.keys(rawData.t).map((hashString) => getTorrentInfo(rawData.t[hashString]));

        return res.status(200).send(parsedData);
      } catch (e) {
        return res.status(500).json({ error: { message: e?.toString() ?? "Error parsing rutorrent data", url, data } });
      }
    }
  }

  return res.status(500).json({ error: "Invalid proxy service type" });
}
