import Disk from "./disk";
import Cpu from "./cpu";
import Memory from "./memory";

export default function Resources({ options }) {
  return (
    <>
      <div className="pr-2 flex flex-col mr-2">
        <div className="flex flex-row space-x-4">
          {options.disk && <Disk options={options} />}
          {options.cpu && <Cpu />}
          {options.memory && <Memory />}
        </div>
        {options.label && (
          <div className="border-t-2 border-theme-800 dark:border-theme-200 mt-1 pt-1 text-center text-theme-800 dark:text-theme-200 text-xs">
            {options.label}
          </div>
        )}
      </div>
    </>
  );
}
