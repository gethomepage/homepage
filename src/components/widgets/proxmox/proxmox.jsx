import { useTranslation } from "next-i18next/pages";
import { FaMemory } from "react-icons/fa";
import { FiCpu, FiHardDrive, FiServer } from "react-icons/fi";
import { SiProxmox } from "react-icons/si";
import useSWR from "swr";

import Container from "../widget/container";
import Error from "../widget/error";
import Raw from "../widget/raw";

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-row items-center mr-2 last:mr-0" title={label}>
      <Icon className="text-theme-800 dark:text-theme-200 w-3.5 h-3.5 mr-1" />
      <span className="text-theme-800 dark:text-theme-200 text-xs">{value}</span>
    </div>
  );
}

export default function Widget({ options }) {
  const { t, i18n } = useTranslation();

  const { data, error } = useSWR(
    `/api/widgets/proxmox?${new URLSearchParams({ lang: i18n.language, ...options }).toString()}`,
    {
      refreshInterval: 1500,
    },
  );

  if (error || data?.error) {
    return <Error options={options} />;
  }

  const name = options.label || options.node || t("proxmox.title");
  const vms = data ? `${data.vms.running}/${data.vms.total}` : "-";
  const lxc = data ? `${data.lxc.running}/${data.lxc.total}` : "-";
  const cpu = data ? t("common.percent", { value: data.cpu.percent }) : "-";
  const mem = data ? t("common.percent", { value: data.memory.percent }) : "-";

  return (
    <Container options={options} additionalClassNames="information-widget-proxmox">
      <Raw>
        <div className="flex-none flex flex-col mr-3 py-1.5">
          <div className="flex flex-row items-center mb-0.5">
            <SiProxmox className="text-theme-800 dark:text-theme-200 w-3 h-3 mr-1" />
            <div className="text-theme-800 dark:text-theme-200 text-xs font-bold">{name}</div>
          </div>
          <div className="flex flex-row items-center flex-wrap">
            {options.vms !== false && <Stat icon={FiServer} value={vms} label={t("proxmox.vms")} />}
            {options.lxc !== false && <Stat icon={FiHardDrive} value={lxc} label={t("proxmox.lxc")} />}
            {options.cpu !== false && <Stat icon={FiCpu} value={cpu} label={t("resources.cpu")} />}
            {options.mem !== false && <Stat icon={FaMemory} value={mem} label={t("resources.mem")} />}
          </div>
        </div>
      </Raw>
    </Container>
  );
}
