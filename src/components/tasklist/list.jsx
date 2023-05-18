import Item from "components/tasklist/item";

export default function List({ tasklist }) {
  return (
    <ul className="mt-3 flex flex-col">
      {tasklist.map((task) => (
        <Item key={task.title} task={task} />
      ))}
    </ul>
  );
}
