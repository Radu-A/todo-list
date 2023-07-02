import React, { useState, useEffect } from "react";
import Form from "../Form/Form";
import List from "../List/List";
import ControlSection from "../ControlSection/ControlSection";
import data from "./data";
import './Main.css'

const Main = () => {
  const parsedData = JSON.parse(data);

  const [tasksList, setTasks] = useState(parsedData);

  const [messageSection, setMessage] = useState();
  // useEffect(() => {
  //   console.log('holi')
  //   setTasks('eat', 'drink');
  // }, [])
  
  return (
    <> 
      <main>
        {messageSection}
        <section>
          <h1>TO DO</h1>
          <h2>---------------------</h2>
        </section>
        <Form setTasks={setTasks} tasksList={tasksList} setMessage={setMessage}/>
        <List setTasks={setTasks} tasksList={tasksList} />
        <ControlSection setTasks={setTasks} tasksList={tasksList} data={parsedData}/>
      </main>
    </>
  );
};

export default Main;
