export default function UsageBar({ percent, additionalClassNames = "" }) {
  const normalized = Math.min(100, Math.max(0, percent));
  return (
    <div className={`mt-0.5 w-full bg-theme-800/30 rounded-full h-1 dark:bg-theme-200/20 ${additionalClassNames}`}>
      <div
        className="bg-theme-800/70 h-1 rounded-full dark:bg-theme-200/50 transition-all duration-1000"
        style={{
          width: `${normalized}%`,
        }}
      />
    </div>
  );
}
