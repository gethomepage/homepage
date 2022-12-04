import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {

  // @see https://github.com/AnalogJ/scrutiny/blob/d8d56f77f9e868127c4849dac74d65512db658e8/webapp/frontend/src/app/shared/device-status.pipe.ts
  const DeviceStatus = {
    passed: 0,
    failed_smart: 1,
    failed_scrutiny: 2,
    failed_both: 3
  }
  
  // @see https://github.com/AnalogJ/scrutiny/blob/d8d56f77f9e868127c4849dac74d65512db658e8/webapp/frontend/src/app/core/config/app.config.ts
  const DeviceStatusThreshold = {
    smart: 1,
    scrutiny: 2,
    both: 3
  }
  
  const { widget } = service;

  const { data: scrutinySettings, error: scrutinySettingsError } = useWidgetAPI(widget, "settings");
  const { data: scrutinyData, error: scrutinyError } = useWidgetAPI(widget, "summary");

  if (scrutinyError || scrutinySettingsError) {
    const finalError = scrutinyError ?? scrutinySettingsError;
    return <Container error={finalError} />;
  }

  if (!scrutinyData || !scrutinySettings) {
    return (
      <Container service={service}>
        <Block label="scrutiny.passed" />
        <Block label="scrutiny.failed" />
        <Block label="scrutiny.unknown" />
      </Container>
    );
  }

  const deviceIds = Object.values(scrutinyData.data.summary);
  const statusThreshold = scrutinySettings.settings.metrics.status_threshold;
  
  const failed = deviceIds.filter(deviceId => (deviceId.device.device_status > 0 && statusThreshold === DeviceStatusThreshold.both) || [statusThreshold, DeviceStatus.failed_both].includes(deviceId.device.device_status))?.length || 0;
  const unknown = deviceIds.filter(deviceId => deviceId.device.device_status < DeviceStatus.passed || deviceId.device.device_status > DeviceStatus.failed_both)?.length || 0;
  const passed = deviceIds.filter(deviceId => deviceId.device.device_status === 0 || (deviceId.device.device_status > statusThreshold && deviceId.device.device_status < DeviceStatus.failed_both))?.length || 0;

  return (
    <Container service={service}>
      <Block label="scrutiny.passed" value={passed} />
      <Block label="scrutiny.failed" value={failed} />
      <Block label="scrutiny.unknown" value={unknown} />
    </Container>
  );
}


