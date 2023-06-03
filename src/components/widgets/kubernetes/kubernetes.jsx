import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Error from "../widget/error";
import Container from "../widget/container";
import Raw from "../widget/raw";

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
      percent: 0
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
    return <Container options={options}>
      <Raw>
        <div className="flex flex-row self-center flex-wrap justify-between">
          {cluster.show &&
            <Node type="cluster" key="cluster" options={options.cluster} data={defaultData} />
          }
          {nodes.show &&
            <Node type="node" key="nodes" options={options.nodes} data={defaultData} />
          }
        </div>
      </Raw>
    </Container>;
  }

  return <Container options={options}>
    <Raw>
      <div className="flex flex-row self-center flex-wrap justify-between">
        {cluster.show &&
          <Node key="cluster" type="cluster" options={options.cluster} data={data.cluster} />
        }
        {nodes.show && data.nodes &&
          data.nodes.map((node) =>
            <Node key={node.name} type="node" options={options.nodes} data={node} />)
        }
      </div>
    </Raw>
  </Container>;
}
