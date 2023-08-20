export default function Container({ children, className = "" }) {
  return (
    <div>
      {children}
      <div className={`absolute top-0 right-0 bottom-0 left-0 overflow-clip pointer-events-none ${className}`} />
      <div className="h-[68px] overflow-clip" />
    </div>
  );
}
