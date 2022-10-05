import classNames from "classnames";

import List from "components/services/list";

export default function ServicesGroup({ services, layout }) {
  return (
    <div
      key={services.name}
      className={classNames(
        layout?.style === "row" ? "basis-full" : "basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4",
        "flex-1 p-1"
      )}
    >
      <h2 className="text-theme-800 dark:text-theme-300 text-xl font-medium">{services.name}</h2>
      <List services={services.services} layout={layout} />
    </div>
  );
}
