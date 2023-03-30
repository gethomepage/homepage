import { getClientIp } from "@supercharge/request-ip";

import { getSettings } from "utils/config/config";

function checkIPRange(ip, ipSpace) {
  // Check if the given IP is in the ipSpace address space using
  // CIDR notation. If ipSpace is a plain IPv4 we just compare them.
  const ipSpaceParts = ipSpace.split("/");
  if (ipSpaceParts.length === 1) {
    if (ip === ipSpace) {
      return true;
    }
  } else if (ipSpaceParts.length === 2) {
    const ipParts = ip.split(".");
    const ipNum = parseInt(ipParts[0], 10) * 256 * 256 * 256 + parseInt(ipParts[1], 10) * 256 * 256 + parseInt(ipParts[2], 10) * 256 + parseInt(ipParts[3], 10);
    const ipSpaceNum = parseInt(ipSpaceParts[0].split(".")[0], 10) * 256 * 256 * 256 + parseInt(ipSpaceParts[0].split(".")[1], 10) * 256 * 256 + parseInt(ipSpaceParts[0].split(".")[2], 10) * 256 + parseInt(ipSpaceParts[0].split(".")[3], 10);
    const mask = 32 - parseInt(ipSpaceParts[1], 10);
    // eslint-disable-next-line no-bitwise
    const maskNum = 0xffffffff << mask;
    // eslint-disable-next-line no-bitwise
    if ((ipNum & maskNum) === (ipSpaceNum & maskNum)) {
      return true;
    }
  } else {
    throw new Error(`Invalid ipSpace: ${ipSpace}`);
  }
  return false;
}

function isRequestProxied(remoteAddress) {
  const settings = getSettings();
  // Check if trustedproxies is set
  const trustedProxies = settings?.trustedproxies;

  // If trustedproxies is set, check if the client IP
  // is in the trustedproxies address space using CIDR notation.
  if (trustedProxies) {
    // Get the connection IP and strip IPv6 from the hybrid IPv4-IPv6 socket
    const ip = remoteAddress.replace(/^.*:/, '');

    for (let i = 0; i < trustedProxies.length; i += 1) {
        const proxy = trustedProxies[i].trim();
        const inRange = checkIPRange(ip, proxy);
        if (inRange) {
            return true;
        }
    }
  }
  return false;
}

export function getRealClientIP(req) {
  const {remoteAddress} = req.socket;
  const proxied = isRequestProxied(remoteAddress);
  
  // If request is proxied we can trust headers, otherwise we return the socket IP
  return proxied ? getClientIp(req) || remoteAddress : remoteAddress;
}

export function isInLocalScope(req) {
  const settings = getSettings();
  // Check if localscope is set
  const localScope = settings?.localscope;

  // If localscope is set, check if the client IP
  // is in the localscope address space using CIDR notation.
  if (localScope) {
    const ip = getRealClientIP(req);

    for (let i = 0; i < localScope.length; i += 1) {
        const localIP = localScope[i].trim();
        const inRange = checkIPRange(ip, localIP)
        if (inRange) {
          return true;
      }
    }
  }
  return false;
}
