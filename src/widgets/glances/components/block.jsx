export default function Block({ position, children }) {
  const positionClasses = Object.entries(position).map(([key, value]) => `${key}-${value}`).join(' ');

  return (
    <div className={`absolute ${positionClasses} z-20 text-sm`}>
      {children}
    </div>
  );
}
