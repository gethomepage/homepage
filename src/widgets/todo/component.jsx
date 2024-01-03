("use client");

import { MdOutlineDelete } from "react-icons/md";
import { useEffect, useState } from "react";
import classNames from "classnames";

import Container from "components/services/widget/container";

export default function Component({ service }) {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");

  function handleChange(e) {
    setInputValue(e.target.value);
  }

  useEffect(() => {
    const localStorageTodos = localStorage.getItem("todos");

    const parsedTodos = localStorageTodos !== null ? JSON.parse(localStorageTodos) : [];

    setTodos(parsedTodos);
  }, []);

  useEffect(() => {
    if (todos.length === 0) return;
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  function handleSubmit(e) {
    e.preventDefault();

    if (inputValue.trim() === "") {
      return;
    }

    setTodos([...todos, inputValue]);
    setInputValue("");
  }

  const handleDelete = (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);

    if (newTodos.length === 0) {
      localStorage.removeItem("todos");
    } else {
      localStorage.setItem("todos", JSON.stringify(newTodos));
    }
  };

  return (
    <Container service={service}>
      <div>
        {todos.map((todo, index) => (
          <div key={`${todo}_${index}`} className="flex flex-row items-center">
            <input type="checkbox" className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1" />
            <input
              className={classNames(
                "bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center text-center p-1",
                inputValue === undefined ? "animate-pulse" : "",
                "service-block",
              )}
              type="text"
              value={todo}
              onChange={handleChange}
              disabled
            />
            <button type="button" onClick={() => handleDelete(index)}>
              <MdOutlineDelete />
            </button>
          </div>
        ))}
        <form className="flex flex-row items-center">
          <input
            type="submit"
            className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 w-4 h-4 flex flex-col items-center justify-center text-center p-1 border border-[#6b7280]"
            onClick={handleSubmit}
            value="+"
          />
          <input
            className={classNames(
              "bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center text-center p-1",
              inputValue === undefined ? "animate-pulse" : "",
              "service-block",
            )}
            type="text"
            value={inputValue}
            onChange={handleChange}
          />
        </form>
      </div>
    </Container>
  );
}
