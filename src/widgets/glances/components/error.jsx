import { useTranslation } from "next-i18next";
import { useContext } from "react";

import { SettingsContext } from "utils/contexts/settings";

export default function Error({ service, error }) {
  const { t } = useTranslation();
  const { settings } = useContext(SettingsContext);

  if (error) {
    if (settings.hideErrors || service?.widget.hide_errors) {
      return null;
    }

    return <div className="absolute bottom-2 left-2 z-20 text-red-400 text-xs opacity-75">{t("widget.api_error")}</div>;
  }
}
