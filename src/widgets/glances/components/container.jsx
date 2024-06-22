import { useContext } from "react";
import { useTranslation } from "next-i18next";
import { SettingsContext } from "utils/contexts/settings";
import Error from "./error"

export default function Container({ service, children, chart = true, error = false, className = "" }) {
  const { t } = useTranslation();
  const { settings } = useContext(SettingsContext);
  const hideErrors = (settings.hideErrors || service.widget.hide_errors)
  return (
    <div>
      {children}
      <div className={`absolute top-0 right-0 bottom-0 left-0 overflow-clip pointer-events-none ${className}`} />
      {chart && <div className="h-[68px] overflow-clip" />}
      {!chart && <div className="h-[16px] overflow-clip" />}
      {error && !hideErrors && <Error />}
    </div>
  );
}
