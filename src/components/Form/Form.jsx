import React, { useState } from "react";

const Form = ({setTasks, tasksList, setMessage}) => {
  // const [addButton, setAddButton] = useState()

  const handleSubmit = (event) => {
    event.preventDefault();
    const newTask = event.target.task.value;
    console.log(newTask);
    setTasks([...tasksList, newTask]);
    // setAddButton();
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
    console.log('holi')
    // setAddButton(<button type="submit">ADD</button>)
    setTimeout(() => {
      // setAddButton();
      setTaskInput(<input type="text" name="task" id="" value='' placeholder="task" onChange={handleChange}/>);
    }, 4000);
  }

  const [taskInput, setTaskInput] = useState(<input type="text" name="task" id="" placeholder="task" onChange={handleChange}/>)

  return (
    <section className='form-section'>
      <form onSubmit={handleSubmit}>
        {taskInput}
        {/* {addButton} */}
        <button type="submit">ADD</button>
      </form>
    </section>
  );
};

export default Form;
