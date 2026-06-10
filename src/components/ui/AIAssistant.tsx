'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, HelpCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Simple markdown renderer to display tables, bullet points, headers and bold text
const renderMarkdown = (text: string) => {
  return text.split('\n').map((line, idx) => {
    // 1. Tables check
    if (line.startsWith('|') && line.endsWith('|')) {
      // Skip alignment line e.g. | :--- | :---: |
      if (line.includes(':---')) return null;
      
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      const isHeader = idx === 0 || (idx > 0 && text.split('\n')[idx - 1].includes('Category'));
      
      return (
        <div key={idx} className={`flex border-b border-white/5 py-2.5 px-3 ${isHeader ? 'bg-white/5 font-extrabold text-cyan-400' : 'text-slate-300'}`}>
          {cells.map((cell, cIdx) => (
            <span key={cIdx} className="flex-1 text-[10px] uppercase tracking-wider text-left">
              {cell.replace(/\*\*/g, '')}
            </span>
          ))}
        </div>
      );
    }

    // 2. Headers
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="text-xs font-black uppercase text-cyan-400 tracking-wider mb-3 mt-4 italic flex items-center gap-1.5 border-b border-cyan-500/20 pb-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> {line.substring(4)}
        </h4>
      );
    }

    // 3. Bullet points
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <li key={idx} className="text-[10px] text-slate-300 ml-4 list-disc mb-1.5 leading-relaxed font-bold">
          {parseBoldText(line.substring(2))}
        </li>
      );
    }

    // 4. Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      return (
        <div key={idx} className="flex gap-2 text-[10px] text-slate-300 mb-2 leading-relaxed font-bold">
          <span className="text-cyan-400 font-extrabold">{numMatch[1]}.</span>
          <span>{parseBoldText(numMatch[2])}</span>
        </div>
      );
    }

    // 5. Normal text line
    if (line.trim() === '') return <div key={idx} className="h-2" />;
    return (
      <p key={idx} className="text-[10px] text-slate-300 leading-relaxed font-bold mb-2">
        {parseBoldText(line)}
      </p>
    );
  });
};

const parseBoldText = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="text-white font-black">{part}</strong>;
    }
    return part;
  });
};

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `### 👋 Welcome to DORM-X AI Assistant!

I am your virtual companion integrated directly into the hostel security platform. 

Here are some topics you can ask me about:
- **"What is the outpass policy?"** (Curfew limits and leave rules)
- **"How do I apply for a leave?"** (Student portal guide)
- **"How does the warden approve outpasses?"** (Warden administrative console instructions)
- **"What is the security lockdown protocol?"** (Emergency SOPs)
- **"Generate system statistics report"** (Fetches real-time counts from the database)

How can I help you today?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user', content: text } as Message];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      if (data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error processing that request.' }]);
      }
    } catch (error) {
      console.error('Failed to communicate with AI endpoint:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Failed to establish connection with security assistant server. Please verify DORM-X backend is running.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const presetQueries = [
    { label: 'Curfew & Outpass Rules', text: 'What is the outpass policy?' },
    { label: 'Generate System Report', text: 'Generate system statistics report' },
    { label: 'How to Request Pass', text: 'How do I apply for a leave?' },
    { label: 'Lockdown Emergency', text: 'What is the security lockdown protocol?' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] text-white">
      {/* 1. FLOATING ACTION TRIGGER */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 cursor-pointer border border-cyan-400/30"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-slate-950 rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 2. EXPANDED PANEL CHATBOX */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="absolute bottom-18 right-0 w-[24rem] sm:w-[28rem] h-[32rem] glass-panel rounded-[2.5rem] flex flex-col overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-50 text-left"
          >
            {/* Header */}
            <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                    DORM-X Sentinel AI
                  </h4>
                  <p className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Online Core
                  </p>
                </div>
              </div>
              <HelpCircle className="w-4 h-4 text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors" />
            </div>

            {/* Messages Body */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 log-scroll bg-black/10">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-semibold ${
                    m.role === 'user'
                      ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400/20 text-white rounded-br-none shadow-md shadow-cyan-950/20'
                      : 'bg-white/[0.03] border border-white/5 text-slate-300 rounded-bl-none'
                  }`}>
                    {m.role === 'assistant' ? (
                      renderMarkdown(m.content)
                    ) : (
                      <p className="text-[10px] leading-relaxed font-bold">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Presets Grid */}
            <div className="px-6 py-3 bg-black/20 border-t border-white/5">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Preset Quick Actions</p>
              <div className="flex flex-wrap gap-1.5">
                {presetQueries.map((pq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(pq.text)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 rounded-full text-[8px] font-extrabold uppercase tracking-wide text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
                  >
                    {pq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Input Footer */}
            <form onSubmit={handleSubmit} className="p-4 bg-white/[0.01] border-t border-white/5 flex gap-2.5">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Sentinel AI policies, instructions..."
                disabled={isLoading}
                className="flex-grow bg-white/5 border border-white/10 outline-none text-[10px] font-bold py-3.5 px-4 rounded-xl text-white placeholder-slate-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="w-11 h-11 bg-white text-black hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl flex items-center justify-center cursor-pointer transition-all disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AIAssistant;
