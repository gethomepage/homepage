import { pingWithPromise } from "minecraft-ping-js";

import createLogger from "utils/logger";
import getServiceWidget from "utils/config/service-helpers";

const proxyName = "minecraftProxyHandler";
const logger = createLogger(proxyName);

export default async function minecraftProxyHandler(req, res) {
    const { group, service } = req.query;
    const serviceWidget = await getServiceWidget(group, service);
    try {
        const pingResponse = await pingWithPromise(serviceWidget.domain, serviceWidget.port || 25565);
        res.status(200).send({
            version: pingResponse.version.name,
            online: true,
            players: pingResponse.players
        });
    } catch (e) {
        logger.warn(e)
        res.status(200).send({
            version: undefined,
            online: false,
            players: undefined
        });
    }
}
