import React, { useState } from "react";

const Form = ({setTasks, tasksList, setMessage}) => {
  const [showAddButton, setShowAddButton] = useState(false);
  
  const handleSubmit = (event) => {
    event.preventDefault();
    const newTask = event.target.task.value;
    console.log(newTask);
    setTasks([...tasksList, newTask]);
    setShowAddButton(false);
    setMessage(
      <section className="message-section">
        <h2>Task added</h2>
      </section>
    );
    setTimeout(() => {
      setMessage();
    }, 4000);
  }

  const handleChange = () => {
    setTaskInput(<input type="text" name="task" id="" placeholder="task" onChange={handleChange}/>);
    console.log('holi');
    setShowAddButton(true);
    setTimeout( async () => {
      setShowAddButton(false);
      setTaskInput(<input type="text" name="task" id="" value='' placeholder="task" onChange={handleChange}/>);
    }, 4000);
  }

  const [taskInput, setTaskInput] = useState(<input type="text" name="task" id="" placeholder="task" onChange={handleChange}/>)

  return (
    <section className='form-section'>
      <form onSubmit={handleSubmit}>
        {taskInput}
        {showAddButton && <button type="submit">ADD</button>}
      </form>
    </section>
  );
};

export default Form;
