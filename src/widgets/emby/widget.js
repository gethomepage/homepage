import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
    api: "{url}/emby/{endpoint}?api_key={key}",
    proxyHandler: genericProxyHandler,

    mappings: {
        Sessions: {
            endpoint: "Sessions",
        },
        Count: {
            endpoint: "Items/Counts",
            validate: [
                "MovieCount",
                "SeriesCount",
                "EpisodeCount",
                "SongCount"
            ]
        },
        PlayControl: {
            method: "POST",
            endpoint: "Sessions/{sessionId}/Playing/{command}",
            segments: ["sessionId", "command"],
        },
    },
};

export default widget;