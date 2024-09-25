// 'proxy' identity provider is meant to be used by a reverse proxy that injects permission headers into the origin
// request. In this case we are relying on our proxy to authenitcate our users and validate their identity.
function getProxyPermissions(userHeader, groupHeader, groupSeparator, request) {
  const user =
    userHeader && request.headers[userHeader.toLowerCase()] ? request.headers[userHeader.toLowerCase()] : null;
  const groupsString =
    groupHeader && request.headers[groupHeader.toLowerCase()] ? request.headers[groupHeader.toLowerCase()] : "";

  return { user, groups: groupsString ? groupsString.split(groupSeparator ?? "|").map((v) => v.trim()) : [] };
}

function createProxyIdentity({ groupHeader, groupSeparator, userHeader }) {
  return {
    getContext: (request) => ({
      provider: "proxy",
      ...(userHeader &&
        request.headers[userHeader] && { [userHeader.toLowerCase()]: request.headers[userHeader.toLowerCase()] }),
      ...(groupHeader &&
        request.headers[groupHeader] && { [groupHeader.toLowerCase()]: request.headers[groupHeader.toLowerCase()] }),
    }),
    getIdentity: (request) => getProxyPermissions(userHeader, groupHeader, groupSeparator, request),
  };
}

async function fetchProxyIdentity([key, context]) {
  return fetch(key, { headers: context.headers }).then((res) => res.json());
}

const ProxyIdentityProvider = {
  create: createProxyIdentity,
  fetch: fetchProxyIdentity,
};

export default ProxyIdentityProvider;
