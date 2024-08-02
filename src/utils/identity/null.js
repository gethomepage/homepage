const NullPermissions = { user: null, groups: [] };

function createNullIdentity() {
  return {
    authorize: () => NullPermissions,
    getContext: () => ({
      provider: "null",
    }),
  };
}

async function fetchNullIdentity([key]) {
  return fetch(key).then((res) => res.json());
}

const NullIdentityProvider = {
  create: createNullIdentity,
  fetch: fetchNullIdentity,
};

export default NullIdentityProvider;
