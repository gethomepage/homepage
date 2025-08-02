import { useContext } from "react";
import { MdVisibility, MdVisibilityOff, MdToggleOff, MdToggleOn } from "react-icons/md";
import { HideContext } from "utils/contexts/hide";

export default function HideSensitiveToggle() {
  const { hideSensitive, setHideSensitive } = useContext(HideContext);

  return (
    <div id="hide-sensitive" className="rounded-full flex self-end" title="Toggle sensitive data visibility">
      <MdVisibility className="text-theme-800 dark:text-theme-200 w-5 h-5 m-1.5" />
      {hideSensitive ? (
        <MdToggleOn
          onClick={() => setHideSensitive(!hideSensitive)}
          className="text-theme-800 dark:text-theme-200 w-8 h-8 cursor-pointer"
        />
      ) : (
        <MdToggleOff
          onClick={() => setHideSensitive(!hideSensitive)}
          className="text-theme-800 dark:text-theme-200 w-8 h-8 cursor-pointer"
        />
      )}
      <MdVisibilityOff className="text-theme-800 dark:text-theme-200 w-5 h-5 m-1.5" />
    </div>
  );
}
