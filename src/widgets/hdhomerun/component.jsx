import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { tuner = 0 } = widget;

  const { data: channelsData, error: channelsError } = useWidgetAPI(widget, "lineup");
  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status");

  if (channelsError || statusError) {
    const finalError = channelsError ?? statusError;
    return <Container service={service} error={finalError} />;
  }

  if (!channelsData || !statusData) {
    return (
      <Container service={service}>
        <Block label="hdhomerun.channels" />
        <Block label="hdhomerun.hd" />
      </Container>
    );
  }

  // Provide a default if not set in the config
  if (!widget.fields) {
    widget.fields = ["channels", "hd"];
  }
  // Limit to a maximum of 4 at a time
  if (widget.fields.length > 4) {
    widget.fields = widget.fields.slice(0, 4);
  }

  return (
    <Container service={service}>
      <Block label="hdhomerun.channels" value={channelsData?.length} />
      <Block label="hdhomerun.hd" value={channelsData?.filter((channel) => channel.HD === 1)?.length} />
      <Block
        label="hdhomerun.tunerCount"
        value={`${statusData?.filter((num) => num.VctNumber != null).length ?? 0} / ${statusData?.length ?? 0}`}
      />
      <Block label="hdhomerun.channelNumber" value={statusData[tuner]?.VctNumber ?? null} />
      <Block label="hdhomerun.channelNetwork" value={statusData[tuner]?.VctName ?? null} />
      <Block label="hdhomerun.signalStrength" value={statusData[tuner]?.SignalStrengthPercent ?? null} />
      <Block label="hdhomerun.signalQuality" value={statusData[tuner]?.SignalQualityPercent ?? null} />
      <Block label="hdhomerun.symbolQuality" value={statusData[tuner]?.SymbolQualityPercent ?? null} />
      <Block label="hdhomerun.clientIP" value={statusData[tuner]?.TargetIP ?? null} />
      <Block label="hdhomerun.networkRate" value={statusData[tuner]?.NetworkRate ?? null} />
      <Block label="hdhomerun.tunerone" value={formatTunerStatus(statusData, 0)} />
      <Block label="hdhomerun.tunertwo" value={formatTunerStatus(statusData, 1)} />
      <Block label="hdhomerun.tunerthree" value={formatTunerStatus(statusData, 2)} />
      <Block label="hdhomerun.tunerfour" value={formatTunerStatus(statusData, 3)} />
    </Container>
  );
}

function formatTunerStatus(statusData, tunerId) {
  const tuner = statusData[tunerId];
  if (!tuner) return "";

  const vctNumber = tuner?.VctNumber ?? "";
  const vctName = tuner?.VctName ?? "";
  const vctFrequency = tuner?.Frequency ?? "-";
  vctFrequency = vctFrequency !== "-" ? `${Number(vctFrequency / 1000000).toFixed(0)} MHz` : "-";

  // Conditional: if vctName is empty, use frequency + signalStrength
  return vctName === "" ? `${vctFrequency}` : `${vctNumber} ${vctName}`;
}
