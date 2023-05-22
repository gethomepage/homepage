import { useState } from "react";

import Item from "components/tasklist/item";

export default function List({listDetail, listUpdate}) {
  const [tasks, setTasks] = useState(listDetail)

  const taskUpdate = () => {
    setTasks(tasks)
    listUpdate()
  }

  return (
    <ul className="mt-3 flex flex-col">
      {tasks.map((task) => (
        <Item key={Object.values(task)[0]} taskDetail={task} taskUpdate={taskUpdate} />
      ))}
    </ul>
  );
}
