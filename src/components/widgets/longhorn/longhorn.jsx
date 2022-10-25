import useSWR from "swr";
import { BiError } from "react-icons/bi";
import { i18n, useTranslation } from "next-i18next";

import Node from "./node";

export default function Longhorn({ options }) {
  const { expanded, total, labels, include, nodes } = options;
  const { t } = useTranslation();
  const { data, error } = useSWR(`/api/widgets/longhorn`, {
    refreshInterval: 1500
  });

  if (error || data?.error) {
    return (
      <div className="flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap">
        <BiError className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-xs">{t("widget.api_error")}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap">
        <div className="flex flex-row self-center flex-wrap justify-between" />
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap">
      <div className="flex flex-row self-center flex-wrap justify-between">
        {data.nodes
          .filter((node) => {
            if (node.id === 'total' && total) {
              return true;
            }
            if (!nodes) {
              return false;
            }
            if (include && !include.includes(node.id)) {
              return false;
            }
            return true;
          })
          .map((node) =>
            <div key={node.id}>
              <Node data={{ node }} expanded={expanded} labels={labels} />
            </div>
          )}
      </div>
    </div>
  );
}
