import {useState} from "react";

export default function TaskBox({submitAction}) {
    // const [tasks, setTasks] = useState(listDetail)
    const [formVal, setFormVal] = useState("")
    // let inputValue = useRef(undefined)

    const handleSubmit = (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault();
        submitAction(formVal);
        setFormVal("");
    }

    return (
        <div className="flex block w-full text-left transition-all h-15 mb-3 rounded-md font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 hover:bg-theme-300/20 dark:bg-white/5 dark:hover:bg-white/10">
            <div className="flex-shrink-0 flex items-center justify-center w-11 bg-theme-500/10 dark:bg-theme-900/50 text-theme-700 hover:text-theme-700 dark:text-theme-200 text-l font-large rounded-l-md">+</div>
            <form className="flex-1 flex items-center justify-between rounded-r-md " onSubmit={handleSubmit}>
                <input type="text" className="textinput text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 hover:bg-theme-300/20 dark:bg-white/5 dark:hover:bg-white/10 flex-1 grow pl-3 py-2 text-xs" id="title" name="title" value={formVal} placeholder="Add new task..." onChange={(e) => setFormVal(e.target.value)} />
            </form>
        </div>
    );
}