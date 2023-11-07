import { ProxyAuthProvider} from "./proxy";
import { NullAuthProvider} from "./null"; 

const AuthProviders = {
    NullAuthProvider,
    ProxyAuthProvider
}; 

function getProviderByKey(key) {
    return AuthProviders.find((provider) => provider.key == key) ?? NullAuthProvider;
}

export function createAuthorizer({auth}) { 
    if (auth) {
        getProviderByKey(Object.keys(auth)[0]).create(auth[ProxyAuthKey]);
    } 
    return NullAuthProvider.create(); 
}

export async function fetchWithAuth(key, context) {
    return getProviderByKey(context.provider).fetch([key, context]);
}

export const filterAllowedServices = (perms, services) => filterAllowedItems(perms, services, 'services'); 
export const filterAllowedBookmarks = (perms, bookmarks) => filterAllowedItems(perms, bookmarks, 'bookmarks'); 
export const filterAllowedWidgets = (perms, widgets) => {
    return widgets.filter((widget) => authItemFilter(perms, widget.options) )
}

function filterAllowedItems({user, groups}, itemGroups, groupKey) {
    return itemGroups.map((group) => ({
        name: group.name,
        [groupKey]: group[groupKey].filter((item) => authItemFilter({user, groups}, item))
    })).filter((group) => group[groupKey].length);
}

function authItemFilter({user, groups}, item) {
    const groupAllow = (('allowGroups' in item)) && groups.some(group => item.allowGroups.includes(group));
    const userAllow = (('allowUsers' in item)) && item.allowUsers.includes(user); 
    const allowAll = (!('allowGroups' in item)) && (!('allowUsers' in item));

    return userAllow || groupAllow || allowAll; 
}

