import ProxyAuthProvider from "./proxy";
import NullAuthProvider from "./null"; 

const AuthProviders = {
    NullAuthProvider,
    ProxyAuthProvider
}; 

function getProviderByKey(key) {
    return AuthProviders.find((provider) => provider.key === key) ?? NullAuthProvider;
}

function authAllow({user, groups}, item) {
    const groupAllow = (('allowGroups' in item)) && groups.some(group => item.allowGroups.includes(group));
    const userAllow = (('allowUsers' in item)) && item.allowUsers.includes(user); 
    const allowAll = (!('allowGroups' in item)) && (!('allowUsers' in item));

    return userAllow || groupAllow || allowAll; 
}

export function checkAllowedGroup(perms, authGroups, groupName) {
    const testGroup = authGroups.find((group) => group.name === groupName )
    return testGroup ? authAllow(perms, testGroup) : true
}


function filterAllowedItems(perms, authGroups, groups, groupKey) {
    return groups.filter((group) => checkAllowedGroup(perms, authGroups, group.name))
    .map((group) => ({
        name: group.name,
        [groupKey]: group[groupKey].filter((item) => authAllow(perms, item))
    }))
    .filter((group) => group[groupKey].length);
}

export function readAuthSettings({provider, groups} = {}) {
    return {
        provider: provider ? getProviderByKey(provider.type).create(provider) : NullAuthProvider.create(), 
        groups: groups ? groups.map((group) => ({
            name: Object.keys(group)[0],
            allowUsers: group[Object.keys(group)[0]].allowUsers, 
            allowGroups: group[Object.keys(group)[0]].allowGroups
        })) : [] 
    }
}

export async function fetchWithAuth(key, context) {
    return getProviderByKey(context.provider).fetch([key, context]);
}

export const filterAllowedServices = (perms, authGroups, services) => filterAllowedItems(perms, authGroups, services, 'services'); 
export const filterAllowedBookmarks = (perms, authGroups, bookmarks) => filterAllowedItems(perms, authGroups, bookmarks, 'bookmarks'); 
export const filterAllowedWidgets = (perms, widgets) => widgets.filter((widget) => authAllow(perms, widget.options))