import useSWR from "swr";
import { FaCarBattery } from "react-icons/fa";
import { useTranslation } from "next-i18next";

import Error from "../widget/error";
import Resource from "../widget/resource";
import Raw from "../widget/raw";
import Container from "../widget/container";

export default function Widget({ options }) {
  const { t } = useTranslation();
  const { expanded } = options;
  let { refresh } = options;
  if (!refresh) refresh = 1500;

  const { data, error } = useSWR(
    `/api/widgets/peanut?${new URLSearchParams({ ...options }).toString()}`,
    {
      refreshInterval: refresh,
    },
  );

  if (error || data?.error) {
    return <Error options={options} />;
  }

  if (!data) {
    return (
      <Container options={options}>
        <Raw>
          <div>
            <Resource
              icon={FaCarBattery}
              value="-"
              label={t("peanut.load")}
              expandedValue="-"
              expandedLabel={t("peanut.battery")}
              expanded={expanded}
              percentage="0"
            />
          </div>
        </Raw>
      </Container>
    );
  }

  return (
    <Container options={options}>
      <Raw>
        <div>
          <Resource
            icon={FaCarBattery}
            value={t("common.number", {
              value: data['ups.load'],
              style: "unit",
              unit: "percent",
              maximumFractionDigits: 0,
            })}
            label={t("peanut.load")}
            expandedValue={t("common.number", {
              value: data['battery.charge'],
              style: "unit",
              unit: "percent",
              maximumFractionDigits: 0,
            })}
            expandedLabel={t("peanut.battery")}
            percentage={data['ups.load']}
            expanded={expanded}
          />
        </div>
        {options.label && (
          <div className="ml-6 pt-1 text-center text-theme-800 dark:text-theme-200 text-xs">{options.label}</div>
        )}
      </Raw>
    </Container>
  );
}
