import useSWR from "swr";
import { FaNetworkWired, FaAngleUp, FaAngleDown } from "react-icons/fa";
import { useTranslation } from "next-i18next";

import Resource from "../widget/resource";
import Error from "../widget/error";

export default function Network({ options, refresh = 1500 }) {
  const { t } = useTranslation();
  if (options.network === true) options.network = "default";

  const { data, error } = useSWR(`/api/widgets/resources?type=network&interfaceName=${options.network}`, {
    refreshInterval: refresh,
  });

  if (error || data?.error) {
    return <Error />;
  }

  if (!data) {
    return (
      <Resource
        icon={FaNetworkWired}
        value="-"
        label={<FaAngleUp />}
        expandedValue="-"
        expandedLabel={<FaAngleDown />}
        percentage="0"
        expanded="true"
      />
    );
  }

  return (
    <>
      <Resource
        icon={FaNetworkWired}
        value={t("common.bits", { value: data?.network?.tx_sec })}
        label={<FaAngleUp />}
        expandedValue={t("common.bits", { value: data?.network?.rx_sec })}
        expandedLabel={<FaAngleDown />}
        percentage="0"
        expanded="true"
      >
        <div className="pt-1 text-theme-800 dark:text-theme-200 text-xs text-center">{data.interface}</div>
      </Resource>

      <Resource
        icon={FaNetworkWired}
        value={t("common.bbytes", { value: data?.network?.tx_bytes })}
        label={<FaAngleUp />}
        expandedValue={t("common.bbytes", { value: data?.network?.rx_bytes })}
        expandedLabel={<FaAngleDown />}
        percentage="0"
        expanded="true"
      >
        <div className="pt-1 text-theme-800 dark:text-theme-200 text-xs text-center">{data.interface}</div>
      </Resource>
    </>
  );
}
