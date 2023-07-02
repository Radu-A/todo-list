import React from "react";

const ControlSection = ({setTasks, tasksList, data}) => {
  const ClearButton = () => {
    const handleClick = () => {
      setTasks([]);
    }
    return (
      <button onClick={handleClick}>CLEAR</button>
    );
  }
  
  const ResetButton = () => {
    const handleClick = () => {
      setTasks(data);
    }
    return (
      <button onClick={handleClick}>RESET</button>
    );
  }
  return (
    <section className='control-section'>
      <ClearButton />
      <ResetButton />
    </section>
  );
};

export default ControlSection;
