export default function Container({ error = false, children, service }) {
  if (error) {
    return (
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{error}</div>
      </div>
    );
  }

  let visibleChildren = children;
  const fields = service?.widget?.fields;
  const type = service?.widget?.type;
  if (fields && type) {
    visibleChildren = children.filter(child => fields.some(field => `${type}.${field}` === child?.props?.label));
  }

  return <div className="relative flex flex-row w-full">{visibleChildren}</div>;
}
