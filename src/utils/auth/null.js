const NullPermissions = { user: null, groups:[]}
const NullAuthKey = "none"

function createNullAuth() {
    return {
        authorize: (request) => NullPermissions,
        getContext: (request) => { return {
            provider: NullAuthKey
        } }, 
    }
} 

async function fetchNullAuth([key, context]) {
    return fetch(key).then((res) => res.json())
}

export const NullAuthProvider = {
    key: NullAuthKey, 
    create: createNullAuth, 
    fetch: fetchNullAuth
}
