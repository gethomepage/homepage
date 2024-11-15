import { useContext } from "react";
import classNames from "classnames";

import { SettingsContext } from "utils/contexts/settings";
import ResolvedIcon from "components/resolvedicon";

export default function Item({ favicon }) {
  const description = favicon.description ?? new URL(favicon.href).hostname;
  const { settings } = useContext(SettingsContext);

  return (
    <li key={favicon.name} id={favicon.id} className="favicon" data-name={favicon.name}>
      <a
        href={favicon.href}
        title={favicon.name}
        rel="noreferrer"
        target={favicon.target ?? settings.target ?? "_blank"}
        className={classNames(
          settings.cardBlur !== undefined && `backdrop-blur${settings.cardBlur.length ? "-" : ""}${settings.cardBlur}`,
          "",
        )}
      >
        <div className="">
            {favicon.icon && (
                <ResolvedIcon icon={favicon.icon} alt={favicon.abbr} />
            )}
            {!favicon.icon && favicon.abbr}

        </div>
      </a>
    </li>
  );
}
