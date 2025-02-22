import axios from "axios";
import loaderAxleImage from './assets/Three-dimensional-3D-digital-model-of-the-loader-drive-axle.jpg';
const API_URL = "http://localhost:7770/api/predict"; // FastAPI backend

class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  async parse(message) {
    message = message.toLowerCase().trim();
    console.log("User message:", message);

    // Handle greetings
    if (["hello", "hi", "hey"].includes(message)) {
      return this.actionProvider.handleGreeting();
    }

    // Handle help requests
    if (message.includes("help") || message.includes("options")) {
      return this.actionProvider.handleOptions({ withAvatar: true });
    }

    // Handle thank you messages
    if (["thanks", "thank you", "thankyou", "thank"].includes(message) || message.includes("thank")) {
      return this.actionProvider.handleThankYou();
    }

    // Handle image requests
    if (["image", "picture"].includes(message)) {
      const imageUrl = loaderAxleImage; // Replace with your image URL
      return this.actionProvider.handleImageResponse(imageUrl);
      // return this.actionProvider.handleCustomMessage();
    }

    try {
      // Send message to FastAPI backend for RAG response
      const response = await axios.post(API_URL, { question: message });

      if (response.data.answer) {
        this.actionProvider.handleBotResponse(response.data.answer);
      } else {
        this.actionProvider.handleBotResponse("Sorry, I didn't understand that.");
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      this.actionProvider.handleBotResponse("I'm having trouble reaching the server. Try again later.");
    }
  }
}

export default MessageParser;
