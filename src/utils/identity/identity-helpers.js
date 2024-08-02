import ProxyIdentityProvider from "./proxy";
import NullIdentityProvider from "./null";

const IdentityProviders = {
  null: NullIdentityProvider,
  proxy: ProxyIdentityProvider,
};

function getProviderByKey(key) {
  return IdentityProviders[key] || NullIdentityProvider;
}

function identityAllow({ user, groups }, item) {
  const groupAllow =
    "allowGroups" in item && item.allowGroups && groups.some((group) => item.allowGroups.includes(group));
  const userAllow = "allowUsers" in item && item.allowUsers && item.allowUsers.includes(user);
  const allowAll = !("allowGroups" in item && item.allowGroups) && !("allowUsers" in item && item.allowUsers);

  return userAllow || groupAllow || allowAll;
}

export function checkAllowedGroup(perms, idGroups, groupName) {
  const testGroup = idGroups.find((group) => group.name === groupName);
  return testGroup ? identityAllow(perms, testGroup) : true;
}

function filterAllowedItems(perms, idGroups, groups, groupKey) {
  return groups
    .filter((group) => checkAllowedGroup(perms, idGroups, group.name))
    .map((group) => ({
      name: group.name,
      [groupKey]: group[groupKey].filter((item) => identityAllow(perms, item)),
    }))
    .filter((group) => group[groupKey].length);
}

export function readIdentitySettings({ provider, groups } = {}) {
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
    provider: provider ? getProviderByKey(provider.type).create(provider) : NullIdentityProvider.create(),
    groups: groupArray,
  };
}

export async function fetchWithIdentity(key, context) {
  return getProviderByKey(context.provider).fetch([key, context]);
}

export const filterAllowedServices = (perms, idGroups, services) =>
  filterAllowedItems(perms, idGroups, services, "services");
export const filterAllowedBookmarks = (perms, idGroups, bookmarks) =>
  filterAllowedItems(perms, idGroups, bookmarks, "bookmarks");
export const filterAllowedWidgets = (perms, widgets) => widgets.filter((widget) => identityAllow(perms, widget.options));
