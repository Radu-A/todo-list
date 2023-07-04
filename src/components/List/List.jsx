import React from "react";
import { v4 as uuidv4 } from 'uuid';
import Card from "./Card/Card";
import './List.css'

const List = ({setTasks, tasksList}) => {
  return (
    <section className='list-section'>
      {tasksList.map((element, i)=><Card setTasks={setTasks} tasksList={tasksList} task={element} key={uuidv4()} />)}
    </section>
  );
};

export default List;
