import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Error from "../widget/error";
import ServiceResource from "../resources/serviceResource";

import ResolvedIcon from "components/resolvedicon";

export default function Widget({ options }) {
  const { i18n } = useTranslation();
  const { icon: iconVal, label, refresh } = options;

  const { data, error } = useSWR(
    `/api/widgets/truenas?${new URLSearchParams({ lang: i18n.language, ...options }).toString()}`,
    {
      refreshInterval: refresh ?? 5000,
    },
  );

  const icon = <ResolvedIcon icon={iconVal ?? "si-truenas"} />;

  if (error || data?.error) {
    return <Error options={options} />;
  }

  const memUsagePercent = Math.round(((data?.memory?.used ?? 0) / (data?.memory?.total ?? 1)) * 100);

  return (
    <ServiceResource
      icon={icon}
      label={label}
      cpuPercent={data?.cpu?.load}
      memFree={data?.memory?.free}
      memPercent={memUsagePercent}
      error={data?.error}
    />
  );
}
