import Disk from "./disk";
import Cpu from "./cpu";
import Memory from "./memory";

export default function Resources({ options }) {
  return (
    <div className="flex flex-col max-w:full basis-1/2 sm:basis-auto self-center">
      <div className="flex flex-row space-x-4 self-center">
        {options.cpu && <Cpu />}
        {options.memory && <Memory />}
        {options.disk && <Disk options={options} />}
      </div>
      {options.label && (
        <div className="border-t-2 border-theme-800 dark:border-theme-200 mt-1 pt-1 text-center text-theme-800 dark:text-theme-200 text-xs">
          {options.label}
        </div>
      )}
    </div>
  );
}
