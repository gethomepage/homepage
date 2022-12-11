import Error from "./error";

export default function Container({ error = false, children, service }) {
  if (error) {
    return <Error error={error} />
  }

  let visibleChildren = children;
  const fields = service?.widget?.fields;
  const type = service?.widget?.type;
  if (fields && type) {
    visibleChildren = children.filter(child => fields.some(field => `${type}.${field}` === child?.props?.label));
  }

  return <div className="relative flex flex-row w-full">{visibleChildren}</div>;
}
