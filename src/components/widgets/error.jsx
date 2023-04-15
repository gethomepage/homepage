import { useTranslation } from "react-i18next";
import { BiError } from "react-icons/bi";
import classNames from "classnames";

export default function Error({ options }) {
  const { t } = useTranslation();

  return (
    <div className={classNames(
      "flex flex-col justify-center first:ml-0 ml-4 mr-2",
      options?.styleBoxed === true && " ml-4 mt-2 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
    )}>
      <div className="flex flex-row items-center justify-end">
        <div className="flex flex-col items-center">
          <BiError className="w-8 h-8 text-theme-800 dark:text-theme-200" />
          <div className="flex flex-col ml-3 text-left">
            <span className="text-theme-800 dark:text-theme-200 text-sm">{t("widget.api_error")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
