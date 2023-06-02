import { useTranslation } from "next-i18next";
import { useCallback, useState } from 'react';
import classNames from "classnames";

import ResolvedIcon from '../../resolvedicon';


export default function BlockList({ label, children, childHeight }) {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);

  const changeState = useCallback(() => setOpen(!isOpen), [isOpen, setOpen]);

  return (
    <div
      className={classNames(
        "bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 w-full p-1",
        children === undefined ? "animate-pulse" : ""
      )}>
      <button type="button" onClick={changeState} className="w-full flex-1 flex flex-col items-center justify-center text-center">
        <div className="font-bold text-xs uppercase">{t(label)}</div>
        <ResolvedIcon icon={isOpen ? "mdi-chevron-down" : "mdi-chevron-up"} />
      </button>
      <div
        className="w-full flex-1 flex flex-col items-center justify-center text-center overflow-hidden transition-height duration-500"
        style={{height: isOpen ? childHeight * (children?.length ?? 1) : 0}}>
        {children}
      </div>
    </div>
  );
}
