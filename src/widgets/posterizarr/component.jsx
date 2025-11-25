import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

const fieldNames = {
  status: "status",
  assets: "assets",
  missing: "missing",
  lastRun: "lastRun"
}

export const posterizarrDefaultFields = [fieldNames.status, fieldNames.missing];

export default function Component({ service }) {
  const { widget } = service;

  widget.fields = widget?.fields?.length ? widget.fields : posterizarrDefaultFields;

  const isStatusEnabled  = widget.fields.includes(fieldNames.status);
  const isAssetsEnabled = widget.fields.includes(fieldNames.assets);
  const isMissingEnabled = widget.fields.includes(fieldNames.missing);
  const isLastRunEnabled = widget.fields.includes(fieldNames.lastRun);

  const { data: statusData, error: statusError } = useWidgetAPI(widget, isStatusEnabled ? fieldNames.status : "");
  const { data: assetsData, error: assetsError } = useWidgetAPI(widget, isAssetsEnabled ? fieldNames.assets : "");
  const { data: missingData, error: missingError } = useWidgetAPI(widget, isMissingEnabled ? fieldNames.missing : "");
  const { data: lastRunData, error: lastRunError } = useWidgetAPI(widget, isLastRunEnabled ? fieldNames.lastRun : "");

  // Error handling
  if (statusError || assetsError || missingError || lastRunError) {
    const error = statusError || assetsError || missingError || lastRunError;

    return <Container service={service} error={error} />;
  }

  // Loading state
  if ((isStatusEnabled && !statusData)
    || (isAssetsEnabled && !assetsData)
    || (isMissingEnabled && !missingData)
    || (isLastRunEnabled && !lastRunData)
  ) {
    return (
      <Container service={service}>
        <Block label="posterizarr.status" />
        <Block label="posterizarr.assets" />
        <Block label="posterizarr.missing" />
        <Block label="posterizarr.lastRun" />
      </Container>
    );
  }

  // Render data
  return (
    <Container service={service}>
      <Block label="posterizarr.status" value={formatStatusResult(statusData)} />
      <Block label="posterizarr.assets" value={formatAssetsResult(assetsData)} />
      <Block label="posterizarr.missing" value={formatMissingResult(missingData)} />
      <Block label="posterizarr.lastRun" value={formatLastRunResult(lastRunData)} />
    </Container>
  );
}

const formatStatusResult = (result) => {
  const status = result?.running;

  if (status === true || status === "true") {
    return "Running";
  } else if (status === false || status === "false") {
    return "Stopped";
  }

  return "Unknown";
}

const formatAssetsResult = (result) => {
  const stats = result?.stats;

  if (!stats) {
    return "Unknown";
  }

  const backgroundsCount = stats.backgrounds || 0;
  const postersCount = stats.posters || 0;
  const seasonsCount = stats.seasons || 0;
  const titlecardsCount = stats.titlecards || 0;

  const totalAssets = backgroundsCount + postersCount + seasonsCount + titlecardsCount;

  return formatNumber(totalAssets);
}

const formatMissingResult = (result) => {
  const missingAssets = result?.categories?.missing_assets;

  if (!missingAssets) {
    return "Unknown";
  }

  const missingCount = missingAssets.count || 0;

  return formatNumber(missingCount);
}


const formatLastRunResult = (result) => {
  const lastRunTimestamp = result?.history[0]?.timestamp;

  console.log('result: ', result);
  console.log('lastRunTimestamp: ', lastRunTimestamp);

  if (!lastRunTimestamp) {
    return "Unknown";
  }

  const d = new Date(lastRunTimestamp);

  const day = String(d.getDate()).padStart(2, "0");
  const month = ["Jan","Feb","Mar","Apr","May","Jun",
                 "Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${hour}:${minute}`;
}

const formatNumber = (num) => {
    const str = String(num);
    // If number is less than 5 digits, return as-is
    if (str.length < 5) return str;
    // Insert commas every 3 digits from the right
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
