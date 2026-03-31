import crypto from "crypto";

import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "ugreenProxyHandler";
const tokenCacheKey = `${proxyName}__token`;
const logger = createLogger(proxyName);

async function login(widget, service) {
  const { url, username, password } = widget;

  // Step 1: Get RSA public key
  const checkUrl = `${url}/ugreen/v1/verify/check?token=`;
  const checkResponse = await httpProxy(checkUrl, {
    method: "POST",
    body: JSON.stringify({ username }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const checkStatus = checkResponse[0];
  const checkHeaders = checkResponse[3];

  if (checkStatus !== 200) {
    logger.error("Failed to get RSA public key from UGREEN NAS, status %d", checkStatus);
    return [checkStatus, null];
  }

  const rsaToken = checkHeaders?.["x-rsa-token"];
  if (!rsaToken) {
    logger.error("No x-rsa-token header in UGREEN verify/check response");
    return [500, null];
  }

  // Step 2: Encrypt password with RSA public key
  let encryptedPassword;
  try {
    let keyPem = Buffer.from(rsaToken, "base64").toString("utf-8");
    // UGOS sends mislabeled PEM: header says PKCS#1 but data is SPKI
    keyPem = keyPem.replace("BEGIN RSA PUBLIC KEY", "BEGIN PUBLIC KEY").replace("END RSA PUBLIC KEY", "END PUBLIC KEY");
    const publicKey = crypto.createPublicKey({ key: keyPem, format: "pem" });
    encryptedPassword = crypto.publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(password)).toString("base64");
  } catch (e) {
    logger.error("Failed to encrypt password for UGREEN NAS: %s", e.message);
    return [500, null];
  }

  // Step 3: Login with encrypted password
  const loginUrl = `${url}/ugreen/v1/verify/login`;
  const loginResponse = await httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify({
      is_simple: true,
      keepalive: true,
      otp: false,
      username,
      password: encryptedPassword,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const loginStatus = loginResponse[0];
  let loginData;
  try {
    loginData = JSON.parse(Buffer.from(loginResponse[2]).toString());
  } catch {
    logger.error("Failed to parse UGREEN login response");
    return [loginStatus, null];
  }

  if (loginStatus !== 200 || loginData.code !== 200) {
    logger.error("UGREEN login failed with code %d", loginData.code ?? loginStatus);
    return [loginStatus === 200 ? 401 : loginStatus, null];
  }

  const token = loginData.data?.token;
  if (token) {
    cache.put(`${tokenCacheKey}.${service}`, token);
  }

  return [200, token];
}

export default async function ugreenProxyHandler(req, res, map) {
  const { group, service, endpoint, index } = req.query;

  if (!group || !service) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  if (!widgets?.[widget.type]?.api) {
    return res.status(403).json({ error: "Service does not support API calls" });
  }

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

  let status;
  let data;

  // Check cache for existing token
  let token = cache.get(`${tokenCacheKey}.${service}`);
  if (!token) {
    [status, token] = await login(widget, service);
    if (status !== 200) {
      return res.status(status).json({ error: "Failed to authenticate with UGREEN NAS" });
    }
  }

  // Append token to URL
  url.searchParams.set("token", token);

  [status, , data] = await httpProxy(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Check for token expiry (UGOS returns code 1024)
  if (status === 200) {
    try {
      const json = JSON.parse(Buffer.from(data).toString());
      if (json.code === 1024) {
        logger.debug("UGREEN token expired, re-authenticating");
        cache.del(`${tokenCacheKey}.${service}`);
        [status, token] = await login(widget, service);
        if (status !== 200) {
          return res.status(status).json({ error: "Failed to re-authenticate with UGREEN NAS" });
        }

        url.searchParams.set("token", token);
        [status, , data] = await httpProxy(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    } catch {
      // response wasn't JSON, pass through
    }
  }

  // Handle HTTP-level auth failures
  if ([401, 403].includes(status)) {
    logger.debug("HTTP %d from UGREEN, re-authenticating", status);
    cache.del(`${tokenCacheKey}.${service}`);
    [status, token] = await login(widget, service);
    if (status !== 200) {
      return res.status(status).json({ error: "Failed to re-authenticate with UGREEN NAS" });
    }

    url.searchParams.set("token", token);
    [status, , data] = await httpProxy(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (status !== 200) {
    logger.debug("HTTP %d from UGREEN API endpoint", status);
    return res.status(status).send(data);
  }

  let responseData = data;
  if (map) {
    try {
      responseData = JSON.parse(Buffer.from(data).toString());
      responseData = map(responseData);
    } catch {
      // pass through raw data if parsing fails
    }
  }

  return res.status(200).json(responseData);
}
