import Container from "../widget/container";
import Raw from "../widget/raw";

import Updates from "./updates";

export default function Resources({ options }) {
  const { expanded } = options;

  return (
    <Container options={options}>
      <Raw>
        <div className="flex flex-row self-center flex-wrap justify-between">
          {("updates" in options ? options.updates : true) && <Updates expanded={expanded} />}
        </div>
        {options.label && (
          <div className="ml-6 pt-1 text-center text-theme-800 dark:text-theme-200 text-xs">{options.label}</div>
        )}
      </Raw>
    </Container>
  );
}
