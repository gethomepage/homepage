import useSWR from "swr";
import { useContext } from "react";
import { FaMemory, FaRegClock, FaThermometerHalf } from "react-icons/fa";
import { FiCpu, FiHardDrive } from "react-icons/fi";
import { useTranslation } from "next-i18next";

import UsageBar from "../resources/usage-bar";
import Error from "../widget/error";
import SingleResource from "../widget/single_resource";
import WidgetIcon from "../widget/widget_icon";
import ResourceValue from "../widget/resource_value";
import ResourceLabel from "../widget/resource_label";
import Resources from "../widget/resources";
import WidgetLabel from "../widget/widget_label";

import { SettingsContext } from "utils/contexts/settings";

const cpuSensorLabels = ["cpu_thermal", "Core", "Tctl"];

function convertToFahrenheit(t) {
  return t * 9/5 + 32
}

export default function Widget({ options }) {
  const { t, i18n } = useTranslation();
  const { settings } = useContext(SettingsContext);

  const { data, error } = useSWR(
    `/api/widgets/glances?${new URLSearchParams({ lang: i18n.language, ...options }).toString()}`, {
      refreshInterval: 1500,
    }
  );

  if (error || data?.error) {
    return <Error options={options} />
  }

  if (!data) {
    return <Resources options={options}>
      <SingleResource>
        <WidgetIcon icon={FiCpu} />
        <ResourceLabel>{t("glances.wait")}</ResourceLabel>
        <UsageBar percent="0" />
      </SingleResource>
      <SingleResource>
        <WidgetIcon icon={FaMemory} />
        <ResourceLabel>{t("glances.wait")}</ResourceLabel>
        <UsageBar percent="0" />
      </SingleResource>
      {options.cputemp &&
        <SingleResource>
          <WidgetIcon icon={FaThermometerHalf} />
          <ResourceLabel>{t("glances.wait")}</ResourceLabel>
          <UsageBar percent="0" />
        </SingleResource>
      }
      {options.uptime &&
          <SingleResource>
            <WidgetIcon icon={FaRegClock} />
            <ResourceLabel>{t("glances.wait")}</ResourceLabel>
            <UsageBar percent="0" />
          </SingleResource>
      }
      {options.label && <WidgetLabel label={options.label} />}
    </Resources>;
  }

  const unit = options.units === "imperial" ? "fahrenheit" : "celsius";
  let mainTemp = 0;
  let maxTemp = 80;
  const cpuSensors = data.sensors?.filter(s => cpuSensorLabels.some(label => s.label.startsWith(label)) && s.type === "temperature_core");
  if (options.cputemp && cpuSensors) {
    try {
      mainTemp = cpuSensors.reduce((acc, s) => acc + s.value, 0) / cpuSensors.length;
      maxTemp = Math.max(cpuSensors.reduce((acc, s) => acc + s.warning, 0) / cpuSensors.length, maxTemp);
      if (unit === "fahrenheit") {
        mainTemp = convertToFahrenheit(mainTemp);
        maxTemp = convertToFahrenheit(maxTemp);
      }
    } catch (e) {
      // cpu sensor retrieval failed
    }
  }
  const tempPercent = Math.round((mainTemp / maxTemp) * 100);

  let disks = [];

  if (options.disk) {
    disks = Array.isArray(options.disk)
      ? options.disk.map((disk) => data.fs.find((d) => d.mnt_point === disk)).filter((d) => d)
      : [data.fs.find((d) => d.mnt_point === options.disk)].filter((d) => d);
  }

  return (
    <Resources options={options} target={settings.target ?? "_blank"}>
      <SingleResource>
        <WidgetIcon icon={FiCpu} />
        <ResourceValue>{t("common.number", {
          value: data.cpu.total,
          style: "unit",
          unit: "percent",
          maximumFractionDigits: 0,
        })}</ResourceValue>
        <ResourceLabel>{t("glances.cpu")}</ResourceLabel>
        <ResourceValue>{t("common.number", {
          value: data.load.min15,
          style: "unit",
          unit: "percent",
          maximumFractionDigits: 0,
        })}</ResourceValue>
        <ResourceLabel>{t("glances.load")}</ResourceLabel>
        <UsageBar percent={data.cpu.total} />
      </SingleResource>
      <SingleResource>
        <WidgetIcon icon={FaMemory} />
        <ResourceValue>{t("common.bytes", {
          value: data.mem.free,
          maximumFractionDigits: 1,
          binary: true,
        })}</ResourceValue>
        <ResourceLabel>{t("glances.free")}</ResourceLabel>
        <ResourceValue>{t("common.bytes", {
          value: data.mem.total,
          maximumFractionDigits: 1,
          binary: true,
        })}</ResourceValue>
        <ResourceLabel>{t("glances.total")}</ResourceLabel>
        <UsageBar percent={data.mem.percent} />
      </SingleResource>
      {disks.map((disk) => (
        <SingleResource key={disk.mnt_point}>
          <WidgetIcon icon={FiHardDrive} />
          <ResourceValue>{t("common.bytes", { value: disk.free })}</ResourceValue>
          <ResourceLabel>{t("glances.free")}</ResourceLabel>
          <ResourceValue>{t("common.bytes", { value: disk.size })}</ResourceValue>
          <ResourceLabel>{t("glances.total")}</ResourceLabel>
          <UsageBar percent={disk.percent} />
        </SingleResource>
      ))}
      {options.cputemp && mainTemp > 0 &&
        <SingleResource>
          <WidgetIcon icon={FaThermometerHalf} />
          <ResourceValue>{t("common.number", {
            value: mainTemp,
            maximumFractionDigits: 1,
            style: "unit",
            unit
          })}</ResourceValue>
          <ResourceLabel>{t("glances.temp")}</ResourceLabel>
          <ResourceValue>{t("common.number", {
            value: maxTemp,
            maximumFractionDigits: 1,
            style: "unit",
            unit
          })}</ResourceValue>
          <ResourceLabel>{t("glances.warn")}</ResourceLabel>
          <UsageBar percent={tempPercent} />
        </SingleResource>
      }
      {options.uptime && data.uptime &&
        <SingleResource>
          <WidgetIcon icon={FaRegClock} />
          <ResourceValue>{data.uptime.replace(" days,", t("glances.days")).replace(/:\d\d:\d\d$/g, t("glances.hours"))}</ResourceValue>
          <ResourceLabel>{t("glances.uptime")}</ResourceLabel>
          <UsageBar percent={Math.round((new Date().getSeconds() / 60) * 100)} />
        </SingleResource>
      }
      {options.label && <WidgetLabel label={options.label} />}
    </Resources>
  );
}
