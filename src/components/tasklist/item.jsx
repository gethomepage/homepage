import {useState} from "react";

export default function Item({taskDetail, taskUpdate}) {
  const [task, setTask] = useState(taskDetail)

  const toggleComplete = () => {
    task.checked = !task.checked;
    setTask(task)
    taskUpdate()
  }

  return (
    <li key={task.title}>
      <div className="flex block w-full text-left transition-all h-15 mb-3 rounded-md font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 hover:bg-theme-300/20 dark:bg-white/5 dark:hover:bg-white/10">
        <div className="flex-shrink-0 flex items-center justify-center w-11 bg-theme-500/10 dark:bg-theme-900/50 text-theme-700 hover:text-theme-700 dark:text-theme-200 text-sm font-medium rounded-l-md">
          <input type="checkbox" className="checkbox bg-theme-500/10 text-theme-200 dark:text-theme-700" id={task.title} defaultChecked={task.checked} onChange={toggleComplete}/>
        </div>
        <div className="flex-1 flex items-center justify-between rounded-r-md ">
          <div className="flex-1 grow pl-3 py-2 text-xs">{task.title}</div>
        </div>
      </div>
    </li>
  );
}