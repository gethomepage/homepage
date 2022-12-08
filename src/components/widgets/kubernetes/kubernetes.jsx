import useSWR from "swr";
import { BiError } from "react-icons/bi";
import { useTranslation } from "next-i18next";

import Node from "./node";

export default function Widget({ options }) {
  const { cluster, nodes } = options;
  const { t, i18n } = useTranslation();

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
    return (
      <div className="flex flex-col justify-center first:ml-0 ml-4">
        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-row items-center">
            <BiError className="w-8 h-8 text-theme-800 dark:text-theme-200" />
            <div className="flex flex-col ml-3 text-left">
              <span className="text-theme-800 dark:text-theme-200 text-sm">{t("widget.api_error")}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap">
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
    <div className="flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap">
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
