import React from "react";
import BotAvatar from "./icons/bot1.png";

const CoBotAvatar = () => {
  return (
    <div className="react-chatbot-kit-chat-bot-avatar">
      <div
        className="react-chatbot-kit-chat-bot-avatar-container"
        style={{ background: "none", width: "50px", height: "50px" }}
      >
        <img
          alt="BotAvatar"
          src={BotAvatar}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    </div>
  );
};

export default CoBotAvatar;
