import { useTranslation } from "react-i18next";

function displayError(error) {
  return JSON.stringify(error[1] ? error[1] : error, null, 4);
}

function displayData(data) {
  return (data.type === 'Buffer') ? Buffer.from(data).toString() : JSON.stringify(data, 4);
}

export default function Error({ error }) {
  const { t } = useTranslation();
  
  if (error?.data?.error) {
    error = error.data.error; // eslint-disable-line no-param-reassign
  }

  return (
    <div className="text-sm bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-100 rounded-md p-2 m-1">
      <div className="font-medium mb-1">Something went wrong.</div>
      <details className="text-xs font-mono whitespace-pre-wrap break-all">
        <summary>{t("widget.debug_info")}</summary>
        <div className="bg-white p-2 text-rose-900">
          <ul>
            <li className="mb-2">
              <span className="text-black">{t("widget.api_error")}:</span> {error.message}
            </li>
            {error.url && <li className="mb-2">
              <span className="text-black">{t("widget.url")}:</span> {error.url}
            </li>}
            {error.rawError && <li className="mb-2">
              <span className="text-black">{t("widget.raw_error")}:</span>
              <div className="ml-2">
                {displayError(error.rawError)}
              </div>
            </li>}
            {error.data && <li className="mb-2">
              <span className="text-black">{t("widget.response_data")}:</span>
              <div className="ml-2">
                {displayData(error.data)}
              </div>
            </li>}
          </ul>
        </div>
      </details>
    </div>
  );
}
