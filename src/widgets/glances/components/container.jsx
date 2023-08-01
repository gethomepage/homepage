export default function Container({ children }) {
  return (
    <div>
      {children}
      <div className="h-[68px] overflow-clip" />
    </div>
  );
}
