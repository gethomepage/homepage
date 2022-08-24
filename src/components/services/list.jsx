import Item from "components/services/item";

export default function List({ services }) {
  return (
    <ul role="list" className="mt-3 flex flex-col">
      {services.map((service) => (
        <Item key={service.name} service={service} />
      ))}
    </ul>
  );
}
