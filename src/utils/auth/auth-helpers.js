import ProxyAuthProvider from "./proxy";
import NullAuthProvider from "./null";

const AuthProviders = {
  null: NullAuthProvider,
  proxy: ProxyAuthProvider,
};

function getProviderByKey(key) {
  return AuthProviders[key] || NullAuthProvider;
}

function authAllow({ user, groups }, item) {
  const groupAllow = "allowGroups" in item && groups.some((group) => item.allowGroups.includes(group));
  const userAllow = "allowUsers" in item && item.allowUsers.includes(user);
  const allowAll = !("allowGroups" in item) && !("allowUsers" in item);

  return userAllow || groupAllow || allowAll;
}

export function checkAllowedGroup(perms, authGroups, groupName) {
  const testGroup = authGroups.find((group) => group.name === groupName);
  return testGroup ? authAllow(perms, testGroup) : true;
}

function filterAllowedItems(perms, authGroups, groups, groupKey) {
  return groups
    .filter((group) => checkAllowedGroup(perms, authGroups, group.name))
    .map((group) => ({
      name: group.name,
      [groupKey]: group[groupKey].filter((item) => authAllow(perms, item)),
    }))
    .filter((group) => group[groupKey].length);
}

export function readAuthSettings({ provider, groups } = {}) {
  let groupArray = [];
  if (groups) {
    if (Array.isArray(groups)) {
      groupArray = groups.map((group) => ({
        name: Object.keys(group)[0],
        allowUsers: group.allowUsers,
        allowGroups: group.allowGroups,
      }));
    } else {
      groupArray = Object.keys(groups).map((group) => ({
        name: group,
        allowUsers: groups[group].allowUsers,
        allowGroups: groups[group].allowGroups,
      }));
    }
  }

  return {
    provider: provider ? getProviderByKey(provider.type).create(provider) : NullAuthProvider.create(),
    groups: groupArray,
  };
}

export async function fetchWithAuth(key, context) {
  return getProviderByKey(context.provider).fetch([key, context]);
}

export const filterAllowedServices = (perms, authGroups, services) =>
  filterAllowedItems(perms, authGroups, services, "services");
export const filterAllowedBookmarks = (perms, authGroups, bookmarks) =>
  filterAllowedItems(perms, authGroups, bookmarks, "bookmarks");
export const filterAllowedWidgets = (perms, widgets) => widgets.filter((widget) => authAllow(perms, widget.options));
