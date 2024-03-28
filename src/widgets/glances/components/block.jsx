export default function Block({ position, children }) {
  return <div className={`absolute ${position} z-20 text-sm pointer-events-none`}>{children}</div>;
}
