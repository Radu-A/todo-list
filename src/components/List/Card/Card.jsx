import React from "react";
import './Card.css';

const Card = ({setTasks, tasksList, task}) => {

  const handleClick = () => {
    const filteredTasks = tasksList.filter(element=>element!==task);
    console.log(filteredTasks);
    setTasks(tasksList.filter(element=>element!==task));
  }

  return (
    <article className="task-card">
      <p>{task}</p>
      <button onClick={handleClick}>DELETE</button>
    </article>
);
};

export default Card;
