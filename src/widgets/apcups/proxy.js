import net from 'node:net';
import { Buffer } from 'node:buffer';

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const logger = createLogger("apcupsProxyHandler");

const DEBUG = false;

const APC_COMMANDS = {
    status: 'status',
    events: 'events',
};

const dumpBuffer = (buffer) => {
    logger.debug(buffer.toString('hex').match(/../g).join(' '))
}

const parseResponse = (buffer) => {
    let ptr = 0;
    const output = [];
    while (ptr < buffer.length) {
        const lineLen = buffer.readUInt16BE(ptr);
        const asciiData = buffer.toString('ascii', ptr + 2, lineLen + ptr + 2);
        if (DEBUG) logger.debug(ptr, lineLen, asciiData);
        output.push(asciiData);
        ptr += 2 + lineLen;
    }

    return output;
}

const statusAsJSON = (statusOutput) => statusOutput?.reduce((output, line) => {
    if (!line || line.startsWith('END APC')) return output;
    const [key, value] = line.trim().split(':');
    const newOutput = { ...output };
    newOutput[key.trim()] = value?.trim();
    return newOutput;
}, {})

const getStatus = async (_host, _port) => new Promise((resolve, reject) => {
    const host = _host ?? '127.0.0.1';
    const port = _port ?? 3551;

    const socket = new net.Socket();
    socket.setTimeout(5000);
    socket.connect({ host, port });

    const fullResponse = [];

    socket.on('connect', () => {
        logger.debug(`Connecting to ${host}:${port}`);
        const buffer = Buffer.alloc(APC_COMMANDS.status.length + 2);
        buffer.writeUInt16BE(APC_COMMANDS.status.length, 0);
        buffer.write(APC_COMMANDS.status, 2);
        socket.write(buffer);
    });

    socket.on('data', (data) => {
        fullResponse.push(data);

        if (data.readUInt16BE(data.length - 2) === 0) {
            try {
                const buffer = Buffer.concat(fullResponse);
                if (DEBUG) dumpBuffer(buffer);
                const output = parseResponse(buffer);
                resolve(output);
            } catch (e) {
                reject(e)
            }
            socket.end();
        }
    });

    socket.on('error', (err) => {
        socket.destroy();
        reject(err);
    });
    socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('socket timeout'));
    });
    socket.on('end', () => {
        logger.debug('socket end');
    });
    socket.on('close', () => {
        logger.debug('socket closed');
    });
})

export default async function apcupsProxyHandler(req, res) {
    const { group, service, index } = req.query;

    if (!group || !service) {
        logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
        return res.status(400).json({ error: "Invalid proxy service type" });
    }

    const widget = await getServiceWidget(group, service, index);
    if (!widget) {
        logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
        return res.status(400).json({ error: "Invalid proxy service type" });
    }

    const data = {};

    try {
        const statusData = await getStatus(widget.host, widget.port);
        const jsonData = statusAsJSON(statusData);

        data.status = jsonData.STATUS;
        data.load = jsonData.LOADPCT;
        data.bcharge = jsonData.BCHARGE;
        data.timeleft = jsonData.TIMELEFT;
    } catch (e) {
        logger.error(e);
        return res.status(500).json({ error: e.message });
    }

    return res.status(200).send(data);
}