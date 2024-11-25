import useSWR from "swr";
import { FaNetworkWired } from "react-icons/fa";
import { useTranslation } from "next-i18next";

import Resource from "../widget/resource";
import Error from "../widget/error";

export default function Network({ options, refresh = 1500 }) {
  const { t } = useTranslation();
  // eslint-disable-next-line no-param-reassign
  if (options.network === true) options.network = "default";

  const { data, error } = useSWR(`/api/widgets/resources?type=network&interfaceName=${options.network}`, {
    refreshInterval: refresh,
  });

  if (error || data?.error) {
    return <Error />;
  }

  if (!data || !data.network || !data.network.rx_sec || !data.network.tx_sec) {
    return (
      <Resource
        icon={FaNetworkWired}
        value="- ↑"
        label="- ↓"
        expandedValue="- ↑"
        expandedLabel="- ↓"
        percentage="0"
        wide
      />
    );
  }

  return (
    <Resource
      icon={FaNetworkWired}
      value={`${t("common.byterate", { value: data.network.tx_sec })} ↑`}
      label={`${t("common.byterate", { value: data.network.rx_sec })} ↓`}
      expandedValue={`${t("common.bytes", { value: data.network.tx_bytes })} ↑`}
      expandedLabel={`${t("common.bytes", { value: data.network.rx_bytes })} ↓`}
      expanded={options.expanded}
      wide
      percentage={(100 * data.network.rx_sec) / (data.network.rx_sec + data.network.tx_sec)}
    />
  );
}
