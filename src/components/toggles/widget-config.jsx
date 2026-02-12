import dynamic from "next/dynamic";
import { useState } from "react";
import { MdWidgets } from "react-icons/md";

const WidgetConfigModal = dynamic(() => import("components/widgets/config/widget-config-modal"), {
  ssr: false,
});

export default function WidgetConfigToggle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div id="widget-config" className="rounded-full flex align-middle self-center mr-3">
        <MdWidgets
          onClick={() => setIsOpen(true)}
          className="text-theme-800 dark:text-theme-200 w-5 h-5 cursor-pointer"
          title="Configure widgets"
        />
      </div>
      {isOpen && <WidgetConfigModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
}
