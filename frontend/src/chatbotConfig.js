import { createChatBotMessage } from "react-chatbot-kit";
import Overview from "./widgets/Overview";
import GlobalStatistics from "./widgets/GlobalStatistics";
import LocalStatistics from "./widgets/LocalStatistics";
import Contact from "./widgets/Contact";
import MedicineDelivery from "./widgets/MedicineDelivery";
import CoBotAvatar from "./CoBotAvatar";
import CustomUserAvatar from "./CustomUserAvatar"; // Import the custom user avatar
import React from "react";
import CustomMessage from './CustomMessage';
import BotChatMessage from "./BotChatMessage";


const config = {
  lang: "no",
  botName: "R2-D2",
  customStyles: {
    botMessageBox: {
      backgroundColor: "#04668a",
    },
    chatButton: {
      backgroundColor: "#0f5faf",
    },
  },
  initialMessages: [
    createChatBotMessage(
      `Hi, I'm here to provide you troubleshoot assistance with Volvo heavy machinery!`
    ),
    createChatBotMessage(
      "Here's a quick overview of what I can help you with. You can also type in.",
      {
        withAvatar: true,
        delay: 400,
        widget: "overview",
      }
    ),
  ],
  state: {},
  customComponents: {
    botAvatar: (props) => <CoBotAvatar {...props} />,
    userAvatar: (props) => <CustomUserAvatar {...props} />, // Add custom user avatar
    botChatMessage: BotChatMessage, 
  },
  customMessages: {
    custom: (props) => <CustomMessage {...props} />, // Render custom message here
  },
  widgets: [
    {
      widgetName: "overview",
      widgetFunc: (props) => <Overview {...props} />,
      mapStateToProps: ["messages"],
    },
    {
      widgetName: "Step-by-Step repair",
      widgetFunc: (props) => <GlobalStatistics />,
    },
    {
      widgetName: "Diagnostic tests",
      widgetFunc: (props) => <LocalStatistics />,
    },
    {
      widgetName: "Parts lookup",
      widgetFunc: (props) => <Contact />,
    },
    {
      widgetName: "Maintenance schedules",
      widgetFunc: (props) => <MedicineDelivery />,
    },
    {
      widgetName: "imageWidget",
      widgetFunc: (props) => <ImageWidget {...props} />,
      mapStateToProps: ["src", "alt"],
    },
  ],
};

export default config;
