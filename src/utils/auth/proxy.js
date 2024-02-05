// 'proxy' auth provider is meant to be used by a reverse proxy that injects permission headers into the origin
// request. In this case we are relying on our proxy to authenitcate our users and validate.
function getProxyPermissions(userHeader, groupHeader, request) {
  const user = userHeader ? request.headers.get(userHeader) : null;
  const groupsString = groupHeader ? request.headers.get(groupHeader) : "";

  return { user, groups: groupsString ? groupsString.split(",").map((v) => v.trimStart()) : [] };
}

function createProxyAuth({ groupHeader, userHeader }) {
  return {
    getContext: (request) => ({
      type: ProxyAuthKey,
      ...(userHeader && { [userHeader]: request.headers.get(userHeader) }),
      ...(groupHeader && { [groupHeader]: request.headers.get(groupHeader) }),
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
