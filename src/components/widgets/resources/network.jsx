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
      />
    );
  }

  return (
    <Resource
      icon={FaNetworkWired}
      value={`${t("common.byterate", { value: data?.network?.tx_sec })} / ${t("common.byterate", {
        value: data?.network?.rx_sec,
      })}`}
      label={data.interface}
      expandedValue={`${t("common.bbytes", { value: data?.network?.tx_bytes })} / ${t("common.bbytes", {
        value: data?.network?.rx_bytes,
      })}`}
      expandedLabel={data.interface}
      expanded={options.expanded}
      wide={true}
      percentage="0"
    />
  );
}
