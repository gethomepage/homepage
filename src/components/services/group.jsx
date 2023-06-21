import classNames from "classnames";
import { Transition } from '@headlessui/react'
import { useState } from 'react'

import List from "components/services/list";
import ResolvedIcon from "components/resolvedicon";

export default function ServicesGroup({ group, services, layout, fiveColumns, disableCollapse}) {

  const [isShowing, setIsShowing] = useState(true)

  return (
    <div
      key={services.name}
      className={classNames(
        layout?.style === "row" ? "basis-full" : "basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4",
        layout?.style !== "row" && fiveColumns ? "3xl:basis-1/5" : "",
        "flex-1 p-1"
      )}
    >
      <div className="flex">
        {/* eslint-disable-next-line no-shadow */}
        <button type="button" disabled={disableCollapse} onClick={() => setIsShowing((isShowing) => !isShowing)} className="grow select-none items-center">
          {layout?.icon &&
            <div className="flex-shrink-0 mr-2 w-7 h-7">
              <ResolvedIcon icon={layout.icon} />
            </div>
          }
          <h2 className="flex text-theme-800 dark:text-theme-300 text-xl font-medium">{services.name}</h2>
        </button>
      </div>
      <Transition show={isShowing}><List group={group} services={services.services} layout={layout} /></Transition>
    </div>
  );
}
