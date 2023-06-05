import useSWR from "swr";
import { useContext } from "react";
import { FaMemory, FaRegClock, FaThermometerHalf } from "react-icons/fa";
import { FiCpu, FiHardDrive } from "react-icons/fi";
import { useTranslation } from "next-i18next";

import Error from "../widget/error";
import Resource from "../widget/resource";
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
      <Resource icon={FiCpu} label={t("glances.wait")} percentage="0" />
      <Resource icon={FaMemory} label={t("glances.wait")} percentage="0" />
      { options.cputemp && <Resource icon={FaThermometerHalf} label={t("glances.wait")} percentage="0" /> }
      { options.uptime && <Resource icon={FaRegClock} label={t("glances.wait")} percentage="0" /> }
      { options.label && <WidgetLabel label={options.label} /> }
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
      <Resource
        icon={FiCpu}
        value={t("common.number", {
          value: data.cpu.total,
          style: "unit",
          unit: "percent",
          maximumFractionDigits: 0,
        })}
        label={t("glances.cpu")}
        expandedValue={t("common.number", {
          value: data.load.min15,
          style: "unit",
          unit: "percent",
          maximumFractionDigits: 0
        })}
        expandedLabel={t("glances.load")}
        percentage={data.cpu.total}
        expanded={options.expanded}
      />
      <Resource
        icon={FaMemory}
        value={t("common.bytes", {
          value: data.mem.free,
          maximumFractionDigits: 1,
          binary: true,
        })}
        label={t("glances.free")}
        expandedValue={t("common.bytes", {
          value: data.mem.total,
          maximumFractionDigits: 1,
          binary: true,
        })}
        expandedLabel={t("glances.total")}
        percentage={data.mem.percent}
        expanded={options.expanded}
      />
      {disks.map((disk) => (
        <Resource key={disk.mnt_point}
          icon={FiHardDrive}
          value={t("common.bytes", { value: disk.free })}
          label={t("glances.free")}
          expandedValue={t("common.bytes", { value: disk.size })}
          expandedLabel={t("glances.total")}
          percentage={disk.percent}
          expanded={options.expanded}
        />
      ))}
      {options.cputemp && mainTemp > 0 &&
        <Resource
          icon={FaThermometerHalf}
          value={t("common.number", {
            value: mainTemp,
            maximumFractionDigits: 1,
            style: "unit",
            unit
          })}
          label={t("glances.temp")}
          expandedValue={t("common.number", {
            value: maxTemp,
            maximumFractionDigits: 1,
            style: "unit",
            unit
          })}
          expandedLabel={t("glances.warn")}
          percentage={tempPercent}
          expanded={options.expanded}
        />
      }
      {options.uptime && data.uptime &&
        <Resource
          icon={FaRegClock}
          value={data.uptime.replace(" days,", t("glances.days")).replace(/:\d\d:\d\d$/g, t("glances.hours"))}
          label={t("glances.uptime")}
          percentage={Math.round((new Date().getSeconds() / 60) * 100).toString()}
        />
      }
      {options.label && <WidgetLabel label={options.label} />}
    </Resources>
  );
}
