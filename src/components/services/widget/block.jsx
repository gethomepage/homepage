export default function Block({ value, label }) {
  return (
    <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
      <div className="font-thin text-sm">{value === undefined || value === null ? "-" : value}</div>
      <div className="font-bold text-xs uppercase">{label}</div>
    </div>
  );
}
