import Image from "next/future/image";
import classNames from "classnames";

import List from "components/services/list";
import resolveIcon from "utils/icon-resolver";

export default function ServicesGroup({ services, layout }) {
  return (
    <div
      key={services.name}
      className={classNames(
        layout?.style === "row" ? "basis-full" : "basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4",
        "flex-1 p-1"
      )}
    >
      <div className="flex select-none items-center">
      {layout?.icon &&
        <Image src={resolveIcon(layout.icon)} width={32} height={32} alt="logo" className="flex-shrink-0 mr-2 w-7 h-7"/>
      }
        <h2 className="text-theme-800 dark:text-theme-300 text-xl font-medium">{services.name}
        </h2>
      </div>
      <List services={services.services} layout={layout} />
    </div>
  );
}
