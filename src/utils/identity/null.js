const NullIdentity = { user: null, groups: [] };

function createNullIdentity() {
  return {
    getIdentity: () => NullIdentity,
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
