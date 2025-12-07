
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Mic, MicOff } from 'lucide-react';
import { ChatMessage } from '../types';
import { createChatSession } from '../services/geminiService';
import { Chat } from '@google/genai';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am HealthLens. I can help you with questions about timing, side effects, interactions, or missed doses. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMessage.text });
      const responseText = result.text; // Access text property directly
      
      const botMessage: ChatMessage = { 
        role: 'model', 
        text: responseText || "I'm sorry, I couldn't generate a response."
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "I'm having trouble connecting right now. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
        // Stop logic is handled by 'end' event usually, but we can force stop if needed
        setIsListening(false);
        return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        setIsListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        // Optional: Auto-send after voice
        // setTimeout(() => handleSend(), 500); 
    };

    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-slate-200 sm:mt-4 overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-slate-200' : 'bg-teal-500'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`p-4 rounded-2xl text-base leading-relaxed whitespace-pre-line ${
                msg.role === 'user' 
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tr-none' 
                  : 'bg-teal-600 text-white shadow-md rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <button
                type="button"
                onClick={toggleListening}
                className={`p-4 rounded-full transition-all duration-300 ${
                    isListening 
                    ? 'bg-red-50 text-red-600 ring-2 ring-red-500 animate-pulse' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title="Speak"
            >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <div className="relative flex-1">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Ask about side effects, interactions..."}
                    className="w-full pl-5 pr-12 py-4 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-teal-500 text-lg placeholder:text-slate-400 text-slate-800 transition-all"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
