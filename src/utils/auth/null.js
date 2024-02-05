const NullPermissions = { user: null, groups: [] };

function createNullAuth() {
  return {
    authorize: () => NullPermissions,
    getContext: () => ({
      provider: NullAuthKey,
    }),
  };
}

async function fetchNullAuth([key]) {
  return fetch(key).then((res) => res.json());
}

const NullAuthProvider = {
  create: createNullAuth,
  fetch: fetchNullAuth,
};

export default NullAuthProvider;
