export default function TopNotification({ icon, children }) {
  return (
    <div className="bg-gray-500 flex items-center justify-center text-white h-6 text-xs fixed inset-0 z-10 animate-appear-top">
      {icon ? <div className="mr-2">{icon}</div> : null}
      <span>{children}</span>
    </div>
  );
}
