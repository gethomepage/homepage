export default function Container({ children, chart = true, className = "" }) {
  return (
    <div>
      {children}
      <div className={`absolute top-0 right-0 bottom-0 left-0 overflow-clip pointer-events-none ${className}`} />
      {chart && <div className="h-[68px] overflow-clip" />}
      {!chart && <div className="h-[16px] overflow-clip" />}
    </div>
  );
}
