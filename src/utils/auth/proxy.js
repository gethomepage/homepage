// Proxy auth is meant to be used by a reverse proxy that injects permission headers into the origin 
// request. In this case we are relying on our proxy to authenitcate our users and validate. 
import {createLogger} from "utils/logger";
import { headers } from 'next/headers'; 

export const ProxyAuthKey="proxy_auth"


function getProxyPermissions(userHeader, groupHeader, request) { 
    const logger = createLogger("proxyAuth")
    const user = (userHeader)?request.headers.get(userHeader):None; 
    if (!user) {
        logger.debug("unable to retreive user. User header doesn't exist or unspecified.")
    }
    const groupsString = (groupHeader)?request.headers.get(groupHeader):""; 
    if (!groupsString) {
        logger.debug("unable to retrieve groups. Groups header doesn't exist or unspecified")
    }

    return {user: user, groups: (groupsString)?groupsString.split(",").map((v) => v.trimStart()):[]}
}

export function createProxyAuth({groupHeader, userHeader}) {
    const logger = createLogger("proxyAuth")

    if (!userHeader) {
        logger.debug("'userHeader' value not specified");
    }
    if (!groupHeader) {
        logger.debug("'groupHeader' value not specified")
    }
    return {
        permissions : (request) => getProxyPermissions(userHeader, groupHeader, request),
        cacheContext: (key) => [ key, {
                ...userHeader && {[userHeader]: headers.get(userHeader) }, 
                ...groupHeader && {[groupHeader]: headers.get(groupHeader)}
            }],
        fetcher: ([key, context]) => {
            fetch(key, {headers: context}).then((res) => res.json())
        }
    } 
}