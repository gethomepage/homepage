import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

export default function Jellyseerr({ service }) {
    const config = service.widget;

    function buildApiUrl(endpoint) {
        const { url } = config;
        const reqUrl = new URL(`/api/v1/${endpoint}`, url);
        return `/api/proxy?url=${encodeURIComponent(reqUrl)}`;
    }

    const fetcher = async (url) => {
        const res = await fetch(url, {
            method: "GET",
            withCredentials: true,
            credentials: "include",
            headers: {
                "X-Api-Key": `${config.key}`,
                "Content-Type": "application/json"
            }
        });
        return await res.json();
    };

    const { data: statsData, error: statsError } = useSWR(buildApiUrl(`request/count`), fetcher);

    if (statsError) {
        return <Widget error="Jellyseerr API Error" />;
    }

    if (!statsData) {
        return (
            <Widget>
                <Block label="Pending" />
                <Block label="Approved" />
                <Block label="Available" />
            </Widget>
        );
    }

    return (
        <Widget>
            <Block label="Pending" value={statsData.pending} />
            <Block label="Approved" value={statsData.approved} />
            <Block label="Available" value={statsData.available} />
        </Widget>
    );
}
