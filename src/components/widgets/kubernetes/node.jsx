import { FiAlertTriangle, FiServer } from "react-icons/fi";
import { SiKubernetes } from "react-icons/si";

import ServiceResource from "../resources/serviceResource";

export default function Node({ type, options, data }) {
  function icon() {
    if (type === "cluster") {
      return <SiKubernetes className="text-theme-800 dark:text-theme-200 w-5 h-5" />;
    }
    if (data.ready) {
      return <FiServer className="text-theme-800 dark:text-theme-200 w-5 h-5" />;
    }
    return <FiAlertTriangle className="text-theme-800 dark:text-theme-200 w-5 h-5" />;
  }

  return (
    <ServiceResource
      icon={icon()}
      label={options.showLabel && options.label}
      cpuPercent={data?.cpu?.percent}
      memFree={data?.memory?.free}
      memPercent={data?.memory?.percent}
      error={data?.error}
    />
  );
}
