import { useState, useRef, useEffect } from 'react';
import api from '../services/api.js';
import { AIBadge } from '../components/ui/index.jsx';

const QUICK = [
  'How many leave days do I get per year?',
  'When is salary credited?',
  'What is the notice period policy?',
  'How do I apply for sick leave?',
  'What are work from home rules?',
  'Explain the performance review process',
  'What benefits does FWC offer?',
  'How does the ESOP program work?',
];

const TypingDots = () => (
  <div className="flex items-center gap-1 py-1">
    {[0, 150, 300].map(d => (
      <span key={d} className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${d}ms` }} />
    ))}
  </div>
);

export default function ChatbotPage() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hello! I'm **ARIA** — your AI HR Assistant at FWC IT Services. 👋\n\nI can help you with:\n• Leave policies & balances\n• Payroll & salary queries\n• Attendance rules\n• Company policies\n• Career & HR procedures\n\nHow can I assist you today?",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Voice input setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SR();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\*\*/g, '').replace(/\n/g, ' ').replace(/•/g, '');
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = 'en-IN'; utt.rate = 1; utt.pitch = 1;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    const userMsg = { role: 'user', content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    try {
      const apiMsgs = updated.map(m => ({ role: m.role, content: m.content.replace(/\*\*/g, '') }));
      const { data } = await api.post('/ai/chat', { messages: apiMsgs });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  const formatMsg = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '&bull; ');
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto" style={{ height: 'calc(100vh - 112px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(34,197,94,0.1))', border: '1px solid rgba(139,92,246,0.3)' }}>🤖</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title text-lg">ARIA</h1>
              <AIBadge label="Powered by Claude" />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>AI Resource Intelligence Assistant · FWC HR</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button onClick={stopSpeaking} className="btn-danger btn-sm">⏹ Stop</button>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-xs font-semibold text-brand-400">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll space-y-4 pr-1" style={{ minHeight: 0 }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-base" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(34,197,94,0.1))', border: '1px solid rgba(139,92,246,0.25)' }}>🤖</div>
            )}
            <div className={`max-w-[78%] group`}>
              <div
                className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={m.role === 'user'
                  ? { background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', borderBottomRightRadius: '4px' }
                  : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)', borderBottomLeftRadius: '4px' }
                }
                dangerouslySetInnerHTML={{ __html: formatMsg(m.content) }}
              />
              {m.role === 'assistant' && (
                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => speak(m.content)} className="text-[10px] px-2 py-0.5 rounded-md transition-colors" style={{ color: 'var(--text-4)', background: 'transparent' }} onMouseOver={e => e.target.style.color = 'var(--text-2)'} onMouseOut={e => e.target.style.color = 'var(--text-4)'}>
                    🔊 Listen
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(m.content)} className="text-[10px] px-2 py-0.5 rounded-md transition-colors" style={{ color: 'var(--text-4)' }}>
                    📋 Copy
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(34,197,94,0.1))', border: '1px solid rgba(139,92,246,0.25)' }}>🤖</div>
            <div className="px-4 py-3 rounded-2xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderBottomLeftRadius: '4px' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 2 && !loading && (
        <div className="flex-shrink-0 py-3">
          <p className="text-xs mb-2" style={{ color: 'var(--text-4)' }}>Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q, i) => (
              <button key={i} onClick={() => send(q)} className="text-xs px-3 py-1.5 rounded-xl transition-all hover:-translate-y-0.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask anything about HR policies, leave, payroll…"
              className="input resize-none pr-12"
              rows={1}
              style={{ maxHeight: '120px', overflowY: 'auto' }}
              disabled={loading}
            />
          </div>
          {/* Voice button */}
          <button onClick={toggleVoice} className={`btn-icon flex-shrink-0 transition-all ${isListening ? 'text-red-400' : 'btn-ghost'}`} style={isListening ? { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', animation: 'pulse 1s infinite' } : {}}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button onClick={() => send()} disabled={!input.trim() || loading} className="btn-primary flex-shrink-0 disabled:opacity-40 px-5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
        <p className="text-[11px] mt-2 text-center" style={{ color: 'var(--text-4)' }}>ARIA uses Claude AI · Voice input supported · Press Enter to send</p>
      </div>
    </div>
  );
}
