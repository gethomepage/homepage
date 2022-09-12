export default function UsageBar({ percent }) {
  return (
    <div className="mt-0.5 w-full bg-theme-800/30 rounded-full h-1 dark:bg-white/20">
      <div
        className="bg-theme-800/70 h-1 rounded-full dark:bg-white/50"
        style={{
          width: `${percent}%`,
        }}
      />
    </div>
  );
}
