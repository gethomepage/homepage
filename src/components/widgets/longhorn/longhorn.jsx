import useSWR from "swr";

import Error from "../widget/error";
import Container from "../widget/container";
import Raw from "../widget/raw";

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
    return <Container options={options}>
      <Raw>
        <div className="flex flex-row self-center flex-wrap justify-between" />
      </Raw>
    </Container>;
  }

  return <Container options={options}>
    <Raw>
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
    </Raw>
  </Container>;
}
