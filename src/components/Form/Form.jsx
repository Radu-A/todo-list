import React, { useState } from "react";

const Form = ({setTasks, tasksList, setMessage}) => {
  const [showAddButton, setShowAddButton] = useState(false);
  const [clearInput, setClearInput] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newTask = event.target.task.value;
    console.log(newTask);
    const re = /\w{6}/gm;
    if (newTask.match(re)) {
      setTasks([...tasksList, newTask]);
      setShowAddButton(false);
      setMessage(
        <section className="ok-section">
          <h2>Task added</h2>
        </section>
      );
      setTimeout(() => {
        setMessage();
      }, 4000);
    } else {
      setMessage(
        <section className="fail-section">
          <h2>New tasks at least 6 characters</h2>
        </section>
      );
      setTimeout(() => {
        setMessage();
      }, 4000);
    }
  }

  const handleChange = () => {
    setClearInput(false);
    console.log('holi');
    setShowAddButton(true);
    setTimeout( async () => {
      setShowAddButton(false);
      setClearInput(true);
    }, 4000);
  }

  return (
    <section className='form-section'>
      <form onSubmit={handleSubmit}>
        {clearInput ? 
          <input type="text" name="task" value='' id="" placeholder="task" onChange={handleChange}/> 
          : <input type="text" name="task" id="" placeholder="task" onChange={handleChange}/>
        }
        {showAddButton && <button type="submit">ADD</button>}
      </form>
    </section>
  );
};

export default Form;
