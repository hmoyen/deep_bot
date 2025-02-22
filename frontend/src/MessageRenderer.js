import React from 'react';

const MessageRenderer = ({ message }) => {
    const imageRegex = /http:\/\/localhost:3000(.*)/; // Regex to check for localhost URLs with the image path
  
    // If the message indicates an image, render it
    if (imageRegex.test(message)) {
      const imageUrl = message.match(imageRegex)[0]; // Extract the URL
      return (
        <div className="message-image-container">
          <img src={imageUrl} alt="Requested Visual" style={{ width: '100%', height: 'auto' }} />
        </div>
      );
    }
  
    // Render regular messages
    return (
      <div className="message-text-container">
        <p>{message}</p>
      </div>
    );
  };

export default MessageRenderer;