import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { createChatSession } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

// Simple formatter to handle bold text and newlines without heavy libraries
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const processText = (input: string) => {
    // Split by newlines first
    return input.split('\n').map((line, lineIndex) => {
      // Process bold markers **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={lineIndex} className={`${line.trim() === '' ? 'h-2' : 'min-h-[1.2em]'}`}>
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={partIndex} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return <div className="leading-relaxed">{processText(text)}</div>;
};

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Olá. Sou o Assistente de Protocolos. Pergunte sobre doses, pontos de MTC ou diretrizes do e-SUS de forma direta.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Keep chat session ref to persist history
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      try {
        chatSessionRef.current = createChatSession();
      } catch (e) {
        console.error("Failed to initialize chat", e);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) {
         chatSessionRef.current = createChatSession();
      }

      const resultStream = await chatSessionRef.current.sendMessageStream({
        message: userMsg.text
      });

      let fullResponseText = "";
      
      const responseMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: responseMsgId,
        role: 'model',
        text: '',
        timestamp: new Date()
      }]);

      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        const textChunk = c.text || "";
        fullResponseText += textChunk;

        setMessages(prev => prev.map(msg => 
          msg.id === responseMsgId 
            ? { ...msg, text: fullResponseText }
            : msg
        ));
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Erro ao processar. Tente novamente.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestions = [
    "Ponto para náusea em gestantes?",
    "Critérios hipertensão APS",
    "Protocolo Dengue Grupo B",
    "Auriculoterapia para ansiedade"
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 flex items-center gap-3">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800">Assistente de Protocolos</h2>
          <p className="text-slate-400 text-xs">Apoio à decisão clínica rápida</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
              msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-blue-600 border border-blue-100'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : msg.isError 
                  ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                  : 'bg-white text-slate-600 rounded-tl-none border border-slate-100'
            }`}>
              {msg.role === 'user' ? (
                msg.text
              ) : (
                <FormattedText text={msg.text} />
              )}
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
           <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-white border border-blue-100 text-blue-600 flex items-center justify-center">
               <Bot size={16} />
             </div>
             <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-2 shadow-sm">
               <Loader2 size={16} className="animate-spin text-blue-500" />
               <span className="text-slate-400 text-sm font-medium">Analisando...</span>
             </div>
           </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        {messages.length < 2 && (
          <div className="mb-4 flex flex-wrap gap-2 justify-center">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => setInputText(s)}
                className="text-xs bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 font-medium"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-2 relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite sua dúvida..."
            className="w-full resize-none p-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all max-h-32 min-h-[50px] text-sm"
            rows={1}
            style={{ minHeight: '50px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;