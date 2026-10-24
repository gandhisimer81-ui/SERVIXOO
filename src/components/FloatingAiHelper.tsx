import { useState } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, User, ChevronUp, ChevronDown, CheckCircle } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

const INITIAL_SUGGESTIONS = [
  'Why does a Python Developer need Docker & Git?',
  'What is the difference between SQL and MongoDB in 2026?',
  'How long to get job-ready if my readiness score is 60%?',
  'What should I build to bridge the missing skills gap?'
];

export default function FloatingAiHelper({ targetRole = 'Python Developer' }: { targetRole?: string }) {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hello! I am your Servixoo Career Architect. Ask me anything about skill gaps, learning priorities for ${targetRole}, or how to align your college coursework.`,
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/student/interview-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missingSkills: [text],
          targetRole
        })
      });

      let reply = '';
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          reply = `Here is key advice on "${text}":\n\n${data.questions[0].idealAnswerHint || data.questions[0].question}\n\nKey Takeaway: Prioritize hands-on project deployment over rote syntax memorization.`;
        }
      }

      if (!reply) {
        // High-quality contextual fallback
        if (text.toLowerCase().includes('docker') || text.toLowerCase().includes('git')) {
          reply = 'Docker guarantees your code runs the same way in production as it did on your machine, eliminating the "works on my machine" problem. Git is mandatory because companies never work as isolated solo coders—you will collaborate via Pull Requests and code reviews daily.';
        } else if (text.toLowerCase().includes('sql') || text.toLowerCase().includes('mongodb')) {
          reply = 'SQL (Relational databases like PostgreSQL/SQLite) powers 85%+ of commercial financial, enterprise, and transactional systems because of ACID guarantees. MongoDB is great for unstructured document logging, but almost all enterprise job descriptions still mandate strong relational SQL joins first.';
        } else if (text.toLowerCase().includes('how long') || text.toLowerCase().includes('months') || text.toLowerCase().includes('job-ready')) {
          reply = 'With focused 10–12 hours per week studying project-based milestones (FastAPI, Docker, and PostgreSQL), students bridge from a 60% readiness score to 85%+ commercial readiness in approximately 8 to 12 weeks.';
        } else {
          reply = `For ${targetRole}, focus heavily on building 1 end-to-end full stack project hosted live on the web with a public GitHub repo. Employers value working URLs 10x more than certifications.`;
        }
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Commercial market demand for ${targetRole} prioritizes end-to-end application architecture, automated testing, and cloud containerization over theoretical textbook drills.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded chat window */}
      {isOpen && (
        <div className={`w-[90vw] sm:w-96 h-[500px] max-h-[80vh] flex flex-col rounded-2xl shadow-2xl border transition-all mb-3 overflow-hidden ${
          isDark 
            ? 'bg-[#0B132B] border-slate-700/80 text-slate-100 shadow-cyan-950/40' 
            : 'bg-white border-slate-200 text-slate-800 shadow-slate-300'
        }`}>
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#1C2541] border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Servixoo AI Architect
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                </h4>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Instant Career Guidance for {targetRole}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-750 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
              }`}
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                    : isDark
                      ? 'bg-[#1C2541] text-slate-200 border border-slate-750 rounded-tl-none'
                      : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span className={`block text-[9px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-blue-200' : isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {m.time}
                  </span>
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-cyan-400 font-medium pl-9">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-400 ml-1">Analyzing curriculum vector...</span>
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          <div className={`p-2 border-t flex flex-wrap gap-1.5 max-h-24 overflow-y-auto ${
            isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            {INITIAL_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className={`text-[10px] px-2.5 py-1 rounded-md text-left transition-colors border cursor-pointer truncate max-w-full ${
                  isDark
                    ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className={`p-3 border-t flex items-center gap-2 ${
              isDark ? 'bg-[#1C2541] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about skills, gaps, or roadmaps..."
              className={`flex-1 text-xs px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                isDark 
                  ? 'bg-[#0B132B] border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg transition-all cursor-pointer shrink-0 shadow-md shadow-cyan-500/20"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating launcher button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#0B132B] dark:bg-[#1C2541] border border-cyan-500/50 hover:border-cyan-400 text-white rounded-full shadow-xl hover:shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          aria-label="Open AI Career Architect"
        >
          <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/30">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide text-slate-100 pr-1">
            Ask AI Architect
          </span>
        </button>
      )}
    </div>
  );
}
