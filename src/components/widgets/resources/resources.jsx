import classNames from "classnames";

import Disk from "./disk";
import Cpu from "./cpu";
import Memory from "./memory";
import CpuTemp from "./cputemp";
import Uptime from "./uptime";

export default function Resources({ options }) {
  const { expanded, units } = options;
  return (
    <div className={classNames(
      "flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap",
      options?.styleBoxed === true && " ml-4 mt-2 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
    )}>
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
    </div>
  );
}
