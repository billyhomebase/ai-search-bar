import { useState } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

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

  const streamResponse = async (conversationHistory: Array<{role: string, content: string}>) => {
    setIsThinking(true);
    
    try {
      //const response = await fetch('/api/chat', {
      const response = await fetch('/api/chatNews', {
        
          method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      setIsThinking(false);

      const msgId = Math.random().toString(36).substring(7);
      setMessages(prev => [...prev, {
        id: msgId,
        role: 'assistant',
        content: '',
        isStreaming: true
      }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setMessages(prev => prev.map(msg => 
                msg.id === msgId 
                  ? { ...msg, isStreaming: false } 
                  : msg
              ));
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedContent += parsed.content;
                setMessages(prev => prev.map(msg => 
                  msg.id === msgId 
                    ? { ...msg, content: accumulatedContent } 
                    : msg
                ));
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

      setMessages(prev => prev.map(msg => 
        msg.id === msgId 
          ? { ...msg, isStreaming: false } 
          : msg
      ));
    } catch (error) {
      console.error('Chat error:', error);
      setIsThinking(false);
      
      const errorMsgId = Math.random().toString(36).substring(7);
      setMessages(prev => [...prev, {
        id: errorMsgId,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        isStreaming: false
      }]);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    addMessage('user', text);
    setInputText("");
    
    const conversationHistory = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: text }
    ];
    
    await streamResponse(conversationHistory);
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