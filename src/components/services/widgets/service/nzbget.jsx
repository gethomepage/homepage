import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";
import { formatBytes } from "utils/stats-helpers";

export default function Nzbget({ service }) {
  const config = service.widget;

  const { data: statusData, error: statusError } = useSWR(formatApiUrl(config, "status"));

  if (statusError) {
    return <Widget error="Nzbget API Error" />;
  }

  if (!statusData) {
    return (
      <Widget>
        <Block label="Rate" />
        <Block label="Remaining" />
        <Block label="Downloaded" />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label="Rate" value={`${formatBytes(statusData.DownloadRate)}/s`} />
      <Block label="Remaining" value={`${Math.round((statusData.RemainingSizeMB / 1024) * 100) / 100} GB`} />
      <Block label="Downloaded" value={`${Math.round((statusData.DownloadedSizeMB / 1024) * 100) / 100} GB`} />
    </Widget>
  );
}
