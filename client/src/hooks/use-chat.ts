import { useState, useEffect, useRef } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const SAMPLE_RESPONSES = [
  "I can certainly help with that. Based on your request, here is a detailed breakdown of the information you're looking for...",
  "That's an interesting question. The concept typically involves several key principles: first, efficiency in design; second, clarity of communication; and third, robustness of implementation.",
  "Here are the top results I found for your query:\n\n1. **React**: A JavaScript library for building user interfaces.\n2. **Tailwind CSS**: A utility-first CSS framework.\n3. **Framer Motion**: A production-ready motion library for React.",
  "To solve this problem, we need to look at the underlying data structures. If we assume a linear time complexity, the solution becomes much more straightforward.",
  "I've analyzed the data and found a few trends that might be relevant to your project. Specifically, the user engagement metrics have shown a 15% increase over the last quarter."
];

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState("");
  
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role,
      content
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const simulateResponse = async () => {
    setIsThinking(true);
    
    // Simulate network delay / "thinking" time
    const thinkingTime = 1500 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, thinkingTime));
    
    setIsThinking(false);
    
    // Pick a random response
    const responseText = SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)];
    
    // Create placeholder message for streaming
    const msgId = Math.random().toString(36).substring(7);
    setMessages(prev => [...prev, {
      id: msgId,
      role: 'assistant',
      content: '',
      isStreaming: true
    }]);
    
    // Stream character by character
    let currentText = "";
    const chars = responseText.split("");
    
    for (let i = 0; i < chars.length; i++) {
      currentText += chars[i];
      
      // Update the message content
      setMessages(prev => prev.map(msg => 
        msg.id === msgId 
          ? { ...msg, content: currentText } 
          : msg
      ));
      
      // Random typing delay
      await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 30));
    }
    
    // Finish streaming
    setMessages(prev => prev.map(msg => 
      msg.id === msgId 
        ? { ...msg, isStreaming: false } 
        : msg
    ));
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    addMessage('user', text);
    setInputText("");
    
    await simulateResponse();
  };

  const clearChat = () => {
    setMessages([]);
    setInputText("");
  };

  return {
    messages,
    isThinking,
    inputText,
    setInputText,
    sendMessage,
    clearChat
  };
}