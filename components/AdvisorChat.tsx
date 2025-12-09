import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertTriangle, X, Download } from 'lucide-react';
import { ChatMessage } from '../types';

interface AdvisorChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

const AdvisorChat: React.FC<AdvisorChatProps> = ({ isOpen, onClose, messages, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput('');
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    
    const chatHistory = messages.map(msg => 
      `[${new Date(msg.timestamp).toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatHistory], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tax_advisor_chat_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Advisor Agent</h3>
            <div className="flex items-center gap-1 text-xs text-slate-300">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleExportChat} 
                className="text-slate-400 hover:text-white transition-colors"
                title="Export Chat History"
            >
                <Download className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-indigo-600" />}
            </div>
            <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
               <Bot className="w-4 h-4 text-indigo-600" />
             </div>
             <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
               <div className="flex gap-1">
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about deductions, rules..."
            className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400">
          <AlertTriangle className="w-3 h-3" />
          <span>AI can make mistakes. Verify with a CPA.</span>
        </div>
      </div>
    </div>
  );
};

export default AdvisorChat;