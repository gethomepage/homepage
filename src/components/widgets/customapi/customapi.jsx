import classNames from "classnames";
import { useTranslation } from "next-i18next/pages";
import { TbApi } from "react-icons/tb";
import useSWR from "swr";

import Container from "../widget/container";
import Error from "../widget/error";
import Raw from "../widget/raw";
import WidgetLabel from "../widget/widget_label";

import ResolvedIcon from "components/resolvedicon";
import { formatValue, getValue } from "widgets/customapi/utils";

export default function CustomApi({ options }) {
  const { t } = useTranslation();

  const { index, icon, label, mappings = [], refreshInterval = 10000 } = options;

  const { data, error } = useSWR(`/api/widgets/customapi?${new URLSearchParams({ index }).toString()}`, {
    refreshInterval: Math.max(1000, refreshInterval),
  });

  if (error || (data?.error && !mappings.some((mapping) => mapping.field === "error"))) {
    return <Error options={options} />;
  }

  return (
    <Container options={options} additionalClassNames="information-widget-customapi">
      <Raw>
        <div className="flex flex-row items-center">
          <div className="flex-none mr-2">
            {icon ? (
              <ResolvedIcon icon={icon} width={24} height={24} />
            ) : (
              <TbApi className="w-6 h-6 text-theme-800 dark:text-theme-200" />
            )}
          </div>
          <div className={classNames("flex flex-wrap items-center gap-0.5", !data && "animate-pulse")}>
            {mappings.map((mapping) => (
              <div key={mapping.label} className="flex flex-col items-center justify-center px-1 text-xs">
                <span className="text-theme-800 dark:text-theme-200">{mapping.label}</span>
                <span className="text-theme-800/70 dark:text-theme-200/50">
                  {data ? formatValue(t, mapping, getValue(mapping.field, data)) : "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
        {label && <WidgetLabel label={label} />}
      </Raw>
    </Container>
  );
}
