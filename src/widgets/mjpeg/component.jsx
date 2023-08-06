import Image from "next/image";

export default function Component({ service }) {
  const { widget } = service;
  const { stream, fit = "contain" } = widget;

  return (
    <div>
      <div className="absolute top-0 bottom-0 right-0 left-0">
        <Image layout="fill" objectFit="fill" className="blur-md" src={stream} alt="stream" />
        <Image layout="fill" objectFit={fit} className="drop-shadow-2xl" src={stream} alt="stream" />
      </div>
      <div className="absolute top-0 right-0 bottom-0 left-0 overflow-clip shadow-[inset_0_0_200px_#000] shadow-theme-700/10 dark:shadow-theme-900/10" />
      <div className="h-[68px] overflow-clip" />
    </div>
  );
}
