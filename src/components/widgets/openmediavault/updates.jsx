import useSWR from "swr";
import { FaDownload } from "react-icons/fa";
import { useTranslation } from "next-i18next";

import Resource from "../widget/resource";
import Error from "../widget/error";

const params = new URLSearchParams({ method: "apt.enumerateUpgraded" }).toString();
const useApi = () => useSWR(`/api/widgets/openmediavault?${params}`);

export default function Uptime({ expanded }) {
  const { t } = useTranslation();
  const { data, error } = useApi();

  if (error || data?.error) {
    return <Error />;
  }

  if (!data || data?.response?.length === 0) {
    return null;
  }

  return (
    <Resource
      icon={FaDownload}
      value={t("openmediavault.updatesAvailable")}
      expandedValue={t("openmediavault.packageCount", { value: data.response.length })}
      expanded={expanded}
    />
  );
}
