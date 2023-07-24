import createLogger from "utils/logger";
import getServiceWidget from "utils/config/service-helpers";

const proxyName = "csgoProxyHandler";
const logger = createLogger(proxyName);
const gamedig = require("gamedig");

export default async function csgoProxyHandler(req, res) {
    const { group, service } = req.query;
    const serviceWidget = await getServiceWidget(group, service);
    const url = new URL(serviceWidget.url);

    try {
        const serverData = await gamedig.query({
            type: "csgo",
            host: url.hostname,
            port: url.port || 27015,
            givenPortOnly: true,
        });

        res.status(200).send({
            online: true,
            name: serverData.name,
            map: serverData.map,
            players: serverData.players.length,
            maxplayers: serverData.maxplayers,
            ping: serverData.ping,
        });
    } catch (e) {
        logger.error(e);

        res.status(200).send({
            online: false
        });
    }
}
