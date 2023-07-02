import React from "react";
import Card from "./Card/Card";
import './List.css'

const List = ({tasksList}) => {
  return (
    <section className='list-section'>
      {tasksList.map((element, i)=><Card task={element} key={i} />)}
    </section>
  );
};

export default List;
