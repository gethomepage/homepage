import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function generateDefinitions(channelsData, statusData, tuner) {
  return {
    channels: {
      label: "hdhomerun.channels",
      value: channelsData?.length,
    },
    hd: {
      label: "hdhomerun.hd",
      value: channelsData?.filter((channel) => channel.HD === 1)?.length,
    },
    tunerCount: {
      label: "hdhomerun.tunerCount",
      value: `${statusData?.filter((num) => num.VctNumber != null).length ?? 0} / ${statusData?.length ?? 0}`,
    },
    channelNumber: {
      label: "hdhomerun.channelNumber",
      value: statusData[tuner]?.VctNumber ?? null,
    },
    channelNetwork: {
      label: "hdhomerun.channelNetwork",
      value: statusData[tuner]?.VctName ?? null,
    },
    signalStrength: {
      label: "hdhomerun.signalStrength",
      value: statusData[tuner]?.SignalStrengthPercent ?? null,
    },
    signalQuality: {
      label: "hdhomerun.signalQuality",
      value: statusData[tuner]?.SignalQualityPercent ?? null,
    },
    symbolQuality: {
      label: "hdhomerun.symbolQuality",
      value: statusData[tuner]?.SymbolQualityPercent ?? null,
    },
    clientIP: {
      label: "hdhomerun.clientIP",
      value: statusData[tuner]?.TargetIP ?? null,
    },
    networkRate: {
      label: "hdhomerun.networkRate",
      value: statusData[tuner]?.NetworkRate ?? null,
    },
  };
}

export default function Component({ service }) {
  const { widget, tuner = 0 } = service;
  const { refreshInterval = 10000, fields = ["channels", "hd"] } = widget;

  const { data: channelsData, error: channelsError } = useWidgetAPI(widget, "lineup", {
    refreshInterval: Math.max(1000, refreshInterval),
  });
  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status", {
    refreshInterval: Math.max(1000, refreshInterval),
  });

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

  const definitions = generateDefinitions(channelsData, statusData, tuner);

  return (
    <Container service={service}>
      {fields.slice(0, 4).map((field) => (
        <Block
          key={field}
          label={definitions[Object.keys(definitions).filter((id) => id === field)].label}
          value={definitions[Object.keys(definitions).filter((id) => id === field)].value}
        />
      ))}
    </Container>
  );
}
