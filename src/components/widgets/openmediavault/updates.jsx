import useSWR from "swr";
import { FaCheck } from "react-icons/fa";
import { useTranslation } from "next-i18next";

import Resource from "../widget/resource";
import Error from "../widget/error";

export default function Uptime({ expanded }) {
  const { t, i18n } = useTranslation();
  const params = { lang: i18n.language, method: "apt.enumerateUpgraded" };
  const { data, error } = useSWR(`/api/widgets/openmediavault?${new URLSearchParams(params).toString()}`);

  if (error || data?.error) {
    return <Error />;
  }

  if (!data || data?.response?.length === 0) {
    return null;
  }

  return (
    <Resource
      icon={FaCheck}
      value={t("openmediavault.updatesAvailable")}
      expandedValue={t("openmediavault.packageCount", { value: data.response.length })}
      expanded={expanded}
    />
  );
}
