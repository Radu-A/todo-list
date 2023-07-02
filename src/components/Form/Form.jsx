import React, { useState } from "react";

const Form = ({setTasks, tasksList, setMessage}) => {
  const [showAddButton, setShowAddButton] = useState(false);

  const [valueInput, setValueInput] = useState(null)

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
    setValueInput(null);
    console.log('holi');
    setShowAddButton(true);
    setTimeout( async () => {
      setShowAddButton(false);
      setValueInput('')
    }, 4000);
  }

  return (
    <section className='form-section'>
      <form onSubmit={handleSubmit}>
        <input type="text" name="task" value={valueInput && valueInput} id="" placeholder="task" onChange={handleChange}/>
        {showAddButton && <button type="submit">ADD</button>}
      </form>
    </section>
  );
};

export default Form;
