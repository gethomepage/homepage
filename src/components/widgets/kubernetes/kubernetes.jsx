import useSWR from "swr";
import { useTranslation } from "next-i18next";
import classNames from "classnames";

import Error from "../error";

import Node from "./node";

export default function Widget({ options }) {
  const { cluster, nodes } = options;
  const { i18n } = useTranslation();

  const defaultData = {
    cpu: {
      load: 0,
      total: 0,
      percent: 0
    },
    memory: {
      used: 0,
      total: 0,
      free: 0,
      precent: 0
    }
  };

  const { data, error } = useSWR(
    `/api/widgets/kubernetes?${new URLSearchParams({ lang: i18n.language }).toString()}`, {
      refreshInterval: 1500
    }
  );

  if (error || data?.error) {
    return <Error options={options} />
  }

  if (!data) {
    return (
      <div className={classNames(
        "flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap",
        options?.styleBoxed === true && " ml-4 mt-2 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
      )}>
        <div className="flex flex-row self-center flex-wrap justify-between">
          {cluster.show &&
            <Node type="cluster" key="cluster" options={options.cluster} data={defaultData} />
          }
          {nodes.show &&
            <Node type="node" key="nodes" options={options.nodes} data={defaultData} />
          }
        </div>
      </div>
    );
  }

  return (
    <div className={classNames(
      "flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap",
      options?.styleBoxed === true && " ml-4 mt-2 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
    )}>
      <div className="flex flex-row self-center flex-wrap justify-between">
        {cluster.show &&
          <Node key="cluster" type="cluster" options={options.cluster} data={data.cluster} />
        }
        {nodes.show && data.nodes &&
          data.nodes.map((node) =>
            <Node key={node.name} type="node" options={options.nodes} data={node} />)
        }
      </div>
    </div>
  );
}
