import { FiHardDrive } from "react-icons/fi";
import { useTranslation } from "next-i18next";

import UsageBar from "../resources/usage-bar";

export default function Node({ data, expanded, labels }) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex-none flex flex-row items-center mr-3 py-1.5">
        <FiHardDrive className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left min-w-[85px]">
        <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
          <div className="pl-0.5">{t("common.bytes", { value: data.node.available })}</div>
          <div className="pr-1">{t("resources.free")}</div>
        </span>
          {expanded && (
            <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
            <div className="pl-0.5">{t("common.bytes", { value: data.node.maximum })}</div>
            <div className="pr-1">{t("resources.total")}</div>
          </span>
          )}
          <UsageBar percent={Math.round((data.node.available / data.node.maximum) * 100)} />
        </div>
      </div>
      {labels && (
        <div className="ml-6 pt-1 text-center text-theme-800 dark:text-theme-200 text-xs">{data.node.id}</div>
      )}
    </>
  );
}
