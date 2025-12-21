import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
import jsonrpcWsProxyHandler from "utils/proxy/handlers/jsonrpc-ws";

const logger = createLogger("truenasProxyHandler");

/**
 * Converts REST API endpoint paths to JSON-RPC method names
 * 
 * TrueNAS is migrating from REST API to JSON-RPC over WebSocket.
 * This function maps the old REST endpoint format to the new RPC method names.
 * 
 * Examples:
 *   "pool" -> "pool.query"
 *   "pool/dataset" -> "pool.dataset.query"
 *   "alert/list" -> "alert.list"
 *   "system/info" -> "system.info"
 * 
 * @param {string} endpoint - REST API endpoint path
 * @returns {string} JSON-RPC method name
 */
function restEndpointToRpcMethod(endpoint) {
  if (!endpoint) return endpoint;
  
  // Special cases for query endpoints
  if (endpoint === "pool") return "pool.query";
  if (endpoint === "pool/dataset") return "pool.dataset.query";
  
  // Generic conversion: replace slashes with dots
  // alert/list -> alert.list, system/info -> system.info
  return endpoint.replaceAll("/", ".");
}

/**
 * Main proxy handler for TrueNAS widget requests
 * Routes requests to either REST API or WebSocket based on configuration
 * 
 * TrueNAS deprecated REST API in 25.04 and will remove it in 26.04.
 * This handler supports both methods during the transition:
 * - REST API for TrueNAS CORE and backwards compatibility
 * - WebSocket JSON-RPC for TrueNAS SCALE (25.04+)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} map - Optional mapping function to transform results
 */
export default async function truenasProxyHandler(req, res, map) {
  const { group, service, index, endpoint } = req.query;

  if (!group || !service) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  // Determine which protocol to use based on widget configuration
  // useWebsocket: true -> JSON-RPC over WebSocket (SCALE 25.04+)
  // useWebsocket: false/undefined -> REST API (CORE, legacy SCALE)
  const useWebSocket = widget?.useWebsocket === true;

  if (!useWebSocket) {
    // Use legacy REST API handler
    logger.debug("TrueNAS proxy using REST API, endpoint=%s", endpoint);
    return credentialedProxyHandler(req, res, map);
  }

  // Convert REST endpoint to JSON-RPC method name for WebSocket handler
  req.query.endpoint = restEndpointToRpcMethod(endpoint);
  logger.debug("TrueNAS proxy using WebSocket, method=%s", req.query.endpoint);
  
  return jsonrpcWsProxyHandler(req, res, map);
}