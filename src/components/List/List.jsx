import React from "react";
import Card from "./Card/Card";
import './List.css'

const List = ({setTasks, tasksList}) => {
  return (
    <section className='list-section'>
      {tasksList.map((element, i)=><Card setTasks={setTasks} tasksList={tasksList} task={element} key={i} />)}
    </section>
  );
};

export default List;
