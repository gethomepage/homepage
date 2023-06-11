import Container from "../widget/container";
import Raw from "../widget/raw";

import Disk from "./disk";
import Cpu from "./cpu";
import Memory from "./memory";
import CpuTemp from "./cputemp";
import Uptime from "./uptime";

export default function Resources({ options }) {
  const { expanded, units } = options;
  return <Container options={options}>
    <Raw>
      <div className="flex flex-row self-center flex-wrap justify-between">
        {options.cpu && <Cpu expanded={expanded} />}
        {options.memory && <Memory expanded={expanded} />}
        {Array.isArray(options.disk)
          ? options.disk.map((disk) => <Disk key={disk} options={{ disk }} expanded={expanded} />)
          : options.disk && <Disk options={options} expanded={expanded} />}
        {options.cputemp && <CpuTemp expanded={expanded} units={units} />}
        {options.uptime && <Uptime />}
      </div>
      {options.label && (
        <div className="ml-6 pt-1 text-center text-theme-800 dark:text-theme-200 text-xs">{options.label}</div>
      )}
    </Raw>
  </Container>;
}
