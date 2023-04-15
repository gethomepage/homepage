import useSWR from "swr";
import classNames from "classnames";

import Error from "../error";

import Node from "./node";

export default function Longhorn({ options }) {
  const { expanded, total, labels, include, nodes } = options;
  const { data, error } = useSWR(`/api/widgets/longhorn`, {
    refreshInterval: 1500
  });

  if (error || data?.error) {
    return <Error options={options} />
  }

  if (!data) {
    return (
      <div className={classNames(
        "flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap",
        options?.styleBoxed === true && " ml-4 mt-2 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
      )}>
        <div className="flex flex-row self-center flex-wrap justify-between" />
      </div>
    );
  }

  return (
    <div className={classNames(
      "flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap",
      options?.styleBoxed === true && " ml-4 mt-2 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
    )}>
      <div className="flex flex-row self-center flex-wrap justify-between">
        {data.nodes
          .filter((node) => {
            if (node.id === 'total' && total) {
              return true;
            }
            if (!nodes) {
              return false;
            }
            if (include && !include.includes(node.id)) {
              return false;
            }
            return true;
          })
          .map((node) =>
            <div key={node.id}>
              <Node data={{ node }} expanded={expanded} labels={labels} />
            </div>
          )}
      </div>
    </div>
  );
}
