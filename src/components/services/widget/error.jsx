import { useTranslation } from "react-i18next";
import { IoAlertCircle } from "react-icons/io5";

function displayError(error) {
  return JSON.stringify(error[1] ? error[1] : error, null, 4);
}

function displayData(data) {
  return data.type === "Buffer" ? Buffer.from(data).toString() : JSON.stringify(data, 4);
}

export default function Error({ error }) {
  const { t } = useTranslation();

  if (typeof error === "string") {
    error = { message: error }; // eslint-disable-line no-param-reassign
  }

  if (error?.data?.error) {
    error = error.data.error; // eslint-disable-line no-param-reassign
  }

  return (
    <details className="px-1 pb-1">
      <summary className="block text-center mt-1 mb-0 mx-auto p-3 rounded bg-rose-900/80 hover:bg-rose-900/95 text-theme-900 cursor-pointer">
        <div className="flex items-center justify-center text-xs font-bold">
          <IoAlertCircle className="mr-1 w-5 h-5" />
          {t("widget.api_error")} {error.message && t("widget.information")}
        </div>
      </summary>
      <div className="bg-white dark:bg-theme-200/50 mt-2 rounded text-rose-900 text-xs font-mono whitespace-pre-wrap break-all">
        <ul className="p-4">
          {error.message && (
            <li>
              <span className="text-black">{t("widget.api_error")}:</span> {error.message}
            </li>
          )}
          {error.url && (
            <li className="mt-2">
              <span className="text-black">{t("widget.url")}:</span> {error.url}
            </li>
          )}
          {error.rawError && (
            <li className="mt-2">
              <span className="text-black">{t("widget.raw_error")}:</span>
              <div className="ml-2">{displayError(error.rawError)}</div>
            </li>
          )}
          {error.data && (
            <li className="mt-2">
              <span className="text-black">{t("widget.response_data")}:</span>
              <div className="ml-2">{displayData(error.data)}</div>
            </li>
          )}
        </ul>
      </div>
    </details>
  );
}
