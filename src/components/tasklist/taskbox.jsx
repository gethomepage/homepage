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
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" id="title" name="title" value={formVal} placeholder="Add new task..." onChange={(e) => setFormVal(e.target.value)} />
            </form>
        </div>
    );
}