/* eslint-disable no-underscore-dangle */
import crypto from "crypto";
import querystring from "querystring";

import { sha256, uniqueRid, validateRid, createEncryptionToken, decrypt, encrypt } from "./tools";

import getServiceWidget from "utils/config/service-helpers";
import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";

const proxyName = "jdownloaderProxyHandler";
const logger = createLogger(proxyName);

async function getWidget(req) {
  const { group, service, index } = req.query;
  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return null;
  }
  const widget = await getServiceWidget(group, service, index);
  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return null;
  }

  return widget;
}

async function login(loginSecret, deviceSecret, params) {
  const rid = uniqueRid();
  const path = `/my/connect?${querystring.stringify({ ...params, rid })}`;

  const signature = crypto.createHmac("sha256", loginSecret).update(path).digest("hex");
  const url = `${new URL(`https://api.jdownloader.org${path}&signature=${signature}`)}`;

  const [status, contentType, data] = await httpProxy(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (status !== 200) {
    logger.error("HTTP %d communicating with jdownloader. Data: %s", status, data.toString());
    return [status, data];
  }

  try {
    const decryptedData = JSON.parse(decrypt(data.toString(), loginSecret));
    const sessionToken = decryptedData.sessiontoken;
    validateRid(decryptedData, rid);
    const serverEncryptionToken = createEncryptionToken(loginSecret, sessionToken);
    const deviceEncryptionToken = createEncryptionToken(deviceSecret, sessionToken);
    return [status, decryptedData, contentType, serverEncryptionToken, deviceEncryptionToken, sessionToken];
  } catch (e) {
    logger.error("Error decoding jdownloader API data. Data: %s", data.toString());
    return [status, null];
  }
}

async function getDevice(serverEncryptionToken, deviceName, params) {
  const rid = uniqueRid();
  const path = `/my/listdevices?${querystring.stringify({ ...params, rid })}`;
  const signature = crypto.createHmac("sha256", serverEncryptionToken).update(path).digest("hex");
  const url = `${new URL(`https://api.jdownloader.org${path}&signature=${signature}`)}`;

  const [status, , data] = await httpProxy(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (status !== 200) {
    logger.error("HTTP %d communicating with jdownloader. Data: %s", status, data.toString());
    return [status, data];
  }

  try {
    const decryptedData = JSON.parse(decrypt(data.toString(), serverEncryptionToken));
    const filteredDevice = decryptedData.list.filter((device) => device.name === deviceName);
    return [status, filteredDevice[0].id];
  } catch (e) {
    logger.error("Error decoding jdownloader API data. Data: %s", data.toString());
    return [status, null];
  }
}

function createBody(rid, query, params) {
  const baseBody = {
    apiVer: 1,
    rid,
    url: query,
  };
  return params ? { ...baseBody, params: [JSON.stringify(params)] } : baseBody;
}

async function queryPackages(deviceEncryptionToken, deviceId, sessionToken, params) {
  const rid = uniqueRid();
  const body = encrypt(JSON.stringify(createBody(rid, "/downloadsV2/queryPackages", params)), deviceEncryptionToken);
  const url = `${new URL(
    `https://api.jdownloader.org/t_${encodeURI(sessionToken)}_${encodeURI(deviceId)}/downloadsV2/queryPackages`,
  )}`;
  const [status, , data] = await httpProxy(url, {
    method: "POST",
    body,
  });

  if (status !== 200) {
    logger.error("HTTP %d communicating with jdownloader. Data: %s", status, data.toString());
    return [status, data];
  }

  try {
    const decryptedData = JSON.parse(decrypt(data.toString(), deviceEncryptionToken));
    return decryptedData.data;
  } catch (e) {
    logger.error("Error decoding JDRss jdownloader data. Data: %s", data.toString());
    return [status, null];
  }
}

export default async function jdownloaderProxyHandler(req, res) {
  const widget = await getWidget(req);

  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }
  logger.debug("Getting data from JDRss API");
  const { username } = widget;
  const { password } = widget;

  const appKey = "homepage";
  const loginSecret = sha256(`${username}${password}server`);
  const deviceSecret = sha256(`${username}${password}device`);
  const email = username;

  const loginData = await login(loginSecret, deviceSecret, {
    appKey,
    email,
  });

  const deviceData = await getDevice(loginData[3], widget.client, {
    sessiontoken: loginData[5],
  });

  const packageStatus = await queryPackages(loginData[4], deviceData[1], loginData[5], {
    bytesLoaded: true,
    bytesTotal: true,
    comment: false,
    enabled: true,
    eta: false,
    priority: false,
    finished: true,
    running: true,
    speed: true,
    status: true,
    childCount: false,
    hosts: false,
    saveTo: false,
    maxResults: -1,
    startAt: 0,
  });

  let totalLoaded = 0;
  let totalBytes = 0;
  let totalSpeed = 0;
  packageStatus.forEach((file) => {
    totalBytes += file.bytesTotal;
    totalLoaded += file.bytesLoaded;
    if (file.finished !== true && file.speed) {
      totalSpeed += file.speed;
    }
  });

  const data = {
    downloadCount: packageStatus.length,
    bytesRemaining: totalBytes - totalLoaded,
    totalBytes,
    totalSpeed,
  };

  return res.send(data);
}
