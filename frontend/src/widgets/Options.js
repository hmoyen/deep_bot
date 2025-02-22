import React from "react";

const Options = (props) => {
  return (
    <div className="options">
      <h2 className="options-header">{props.title}</h2>
      <div className="options-container">
        {props.options.map((option) => {
          return (
            <div
              className="option-item"
              onClick={option.handler}
              key={option.id}
            >
              {option.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Options;
