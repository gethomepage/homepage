import { useTranslation } from "next-i18next";

import ErrorBoundary from "components/errorboundry";
import components from "widgets/components";

export default function Widget({ service }) {
  const { t } = useTranslation("common");

  const ServiceWidget = components[service.widget.type];

  if (ServiceWidget) {
    return (
      <ErrorBoundary>
        <ServiceWidget service={service} />
      </ErrorBoundary>
    );
  }

  return (
    <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
      <div className="font-thin text-sm">{t("widget.missing_type", { type: service.widget.type })}</div>
    </div>
  );
}
