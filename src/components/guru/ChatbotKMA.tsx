"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Loader2, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";

type Message = {
  role: "user" | "model";
  content: string;
};

export default function ChatbotKMA() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "<p>Halo Bapak/Ibu Guru! 👋 Saya <strong>Konsultan KMA 1503</strong> Anda. Ada yang bisa saya bantu terkait penyusunan skenario pembelajaran, Kurikulum Berbasis Cinta, atau ide <em>Deep Learning</em> hari ini?</p>",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat-kma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      
      if (res.ok && data.text) {
        setMessages((prev) => [...prev, { role: "model", content: data.text }]);
      } else {
        throw new Error(data.error || "Gagal mendapatkan respons AI");
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: `<p class="text-red-500">Maaf, terjadi kesalahan: ${error.message}</p>` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-2xl flex items-center justify-center text-white z-50 hover:scale-110 active:scale-95 transition-transform"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-slate-50 rounded-full animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 w-[calc(100vw-32px)] sm:w-96 h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] z-50 flex flex-col overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 flex items-center justify-between text-white shrink-0 shadow-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Konsultan KMA 1503</h3>
                  <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={\`flex gap-3 max-w-[90%] \${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}\`}
                >
                  <div className={\`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 \${msg.role === 'user' ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-600'}\`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div 
                    className={\`p-3 rounded-2xl text-sm leading-relaxed shadow-sm \${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none prose prose-sm prose-emerald'}\`}
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                  />
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={handleSend} className="flex items-end gap-2 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ketik pertanyaan Anda..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm resize-none max-h-32"
                  rows={Math.min(Math.max(input.split('\\n').length, 1), 4)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-2 w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              <div className="text-[10px] text-center text-slate-400 mt-2">
                AI dapat membuat kesalahan. Harap periksa kembali hasil generasi.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
