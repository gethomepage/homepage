import Disk from "./disk";
import Cpu from "./cpu";
import Memory from "./memory";

export default function Resources({ options }) {
  const { expanded, backend } = options;
  return (
    <div className="flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap">
      <div className="flex flex-row self-center flex-wrap justify-between">
        {options.cpu && <Cpu expanded={expanded} backend={backend} />}
        {options.memory && <Memory expanded={expanded} backend={backend} />}
        {Array.isArray(options.disk)
          ? options.disk.map((disk) => <Disk key={disk} options={{ disk }} expanded={expanded} backend={backend} />)
          : options.disk && <Disk options={options} expanded={expanded} backend={backend} />}
      </div>
      {options.label && (
        <div className="ml-6 pt-1 text-center text-theme-800 dark:text-theme-200 text-xs">{options.label}</div>
      )}
    </div>
  );
}
