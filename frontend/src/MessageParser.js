import axios from "axios";
import loaderAxleImage from './assets/Three-dimensional-3D-digital-model-of-the-loader-drive-axle.jpg';
const API_URL = "http://localhost:7770/api/predict"; // FastAPI backend
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Add event listeners for recognition
    this.recognition.onresult = (e) => {
      if (e.results[0].isFinal) {
        const transcript = e.results[0][0].transcript;
        this.recognition.abort();
        this.parse_speech(transcript);
      }
    };
  }

  // Start speech recognition
  startRecognition() {
    this.recognition.start();
  }

  // Stop speech recognition
  stopRecognition() {
    this.recognition.abort();
  }

  // Handle parsing the speech message
  parse_speech(message) {
    console.log('Speech message:', message);
    this.parse(message);
    setTimeout(() => {
      this.recognition.start();
    }, 2000);
  }

  // Main message parsing logic
  async parse(message) {
    message = message.toLowerCase().trim();
    console.log("User message:", message);

    // Check for the command to activate voice control
    if (message.includes("activate voice control")) {
      console.log("Voice control activated.");
      this.startRecognition();  // Start speech recognition
      return this.actionProvider.handleBotResponse("Voice control activated!");
    }

    // Handle greetings
    if (["hello", "hi", "hey", "Hello!"].includes(message)) {
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
