// 'proxy' auth provider is meant to be used by a reverse proxy that injects permission headers into the origin
// request. In this case we are relying on our proxy to authenitcate our users and validate.
function getProxyPermissions(userHeader, groupHeader, request) {
  const user =
    userHeader && request.headers[userHeader.toLowerCase()] ? request.headers[userHeader.toLowerCase()] : null;
  const groupsString =
    groupHeader && request.headers[groupHeader.toLowerCase()] ? request.headers[groupHeader.toLowerCase()] : "";

  return { user, groups: groupsString ? groupsString.split("|").map((v) => v.trim()) : [] };
}

function createProxyAuth({ groupHeader, userHeader }) {
  return {
    getContext: (request) => ({
      provider: "proxy",
      ...(userHeader &&
        request.headers[userHeader] && { [userHeader.toLowerCase()]: request.headers[userHeader.toLowerCase()] }),
      ...(groupHeader &&
        request.headers[groupHeader] && { [groupHeader.toLowerCase()]: request.headers[groupHeader.toLowerCase()] }),
    }),
    authorize: (request) => getProxyPermissions(userHeader, groupHeader, request),
  };
}

async function fetchProxyAuth([key, context]) {
  return fetch(key, { headers: context.headers }).then((res) => res.json());
}

const ProxyAuthProvider = {
  create: createProxyAuth,
  fetch: fetchProxyAuth,
};

export default ProxyAuthProvider;
