const NullPermissions = { user: null, groups:[]}
const NullAuthKey = "none"

function createNullAuth() {
    return {
        authorize: () => NullPermissions,
        getContext: () => ({
            provider: NullAuthKey
        }), 
    }
} 

async function fetchNullAuth([key]) {
    return fetch(key).then((res) => res.json())
}

const NullAuthProvider = {
    key: NullAuthKey, 
    create: createNullAuth, 
    fetch: fetchNullAuth
}

export default NullAuthProvider;
