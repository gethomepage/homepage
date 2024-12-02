export default function Subscription({ channel, sinceStart }) {
  return (
    <div className="flex flex-col pb-1 mx-1">
      <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
        <div className="absolute left-2 text-xs mt-[2px]">{channel}</div>
        <div className="grow " />
        <div className="self-center text-xs flex justify-end mr-2 mt-[2px]">{sinceStart}</div>
      </div>
    </div>
  );
}
