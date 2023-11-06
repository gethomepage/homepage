import { getSettings } from "utils/config/config";
import { ProxyAuthKey, createProxyAuth } from "./proxy";

export const NullPermissions = { user: null, groups:[]}

export const NullAuth = {
    permissions: (request) => NullPermissions,
    cacheContext: (key) => key, 
    fetcher: (key) => fetch(key).then((res) => res.json()) 
}

export function createAuthFromSettings() { 
    const {auth} = getSettings(); 
    if (auth) {
        switch (Object.keys(auth)[0]) {
            case ProxyAuthKey: 
                return createProxyAuth(auth[ProxyAuthKey]); 
            default: 
                return NullAuth; 
        }
    } 
    return NullAuth
}

export const filterAllowedServices = (perms, services) => filterAllowedItems(perms, services, 'services'); 
export const filterAllowedBookmarks = (perms, bookmarks) => filterAllowedItems(perms, bookmarks, 'bookmarks'); 
export const filterAllowedWidgets = (perms, widgets) => filterAllowedItems(perms, widgets, 'widgets')

function filterAllowedItems({user, groups}, itemGroups, groupKey) {
    return itemGroups.map((group) => ({
        name: group.name,
        [groupKey]: group[groupKey].filter((item) => authItemFilter({user, groups}, item))
    })).filter((group) => !group[groupKey].length)
}

function authItemFilter({user, groups}, item) {
    const groupAllow = (!(allowGroups in item)) || groups.some(group => item.allowGroups.includes(group));
    const userAllow = (!(allowUsers in item)) || item.allowUsers.includes(user); 

    return userAllow || groupAllow; 
}

