import Options from "./Options";
import React from "react";


const GeneralOptions = (props) => {
  const options = [
    {
      name: "Step by Step Repair",
      handler: props.actionProvider.handleGlobalStats,
      id: 1
    },
    {
      name: "Diagnostic tests",
      handler: props.actionProvider.handleLocalStats,
      id: 2
    },
    {
      name: "Parts lookup",
      handler: props.actionProvider.handleContact,
      id: 3
    },
    {
      name: "Voice Control",
      handler: props.actionProvider.handleContact,
      id: 4
    }
  ];
  return <Options options={options} title="Options" {...props} />;
};

export default GeneralOptions;
