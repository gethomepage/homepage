import { useContext } from "react";
import classNames from "classnames";

import Error from "./error";

import { SettingsContext } from "utils/contexts/settings";

export default function Container({ children, widget, error = null, chart = true, className = "" }) {
  const { settings } = useContext(SettingsContext);
  const hideErrors = settings.hideErrors || widget?.hideErrors;

  if (error) {
    if (hideErrors) {
      return null;
    }

    return <Error />;
  }

  return (
    <div className={classNames("service-container", chart ? "chart relative h-[68px]" : "")}>
      {children}
      <div className={`absolute -top-10 right-0 bottom-0 left-0 overflow-clip pointer-events-none ${className}`} />
      {chart && <div className="h-[68px] overflow-clip" />}
      {!chart && <div className="h-[16px] overflow-clip" />}
    </div>
  );
}
