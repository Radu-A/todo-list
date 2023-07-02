import React from "react";

const Card = ({task}) => {
  return (
    <article className="task-card">
      <p>{task}</p>
    </article>
);
};

export default Card;
