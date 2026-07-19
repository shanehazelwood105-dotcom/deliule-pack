import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw } from "lucide-react";
import { ChatMessage } from "@/components/chat-message";
import { useChat } from "@/hooks/use-chat";
import { useListOpenaiMessages } from "@workspace/api-client-react";

function PSHint({ symbol, color, bg, text }: { symbol: string; color: string; bg: string; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-full ${bg} flex items-center justify-center text-xs font-bold shadow-md ${color}`}>{symbol}</div>
      <span className="text-white/30 text-xs">{text}</span>
    </div>
  );
}

export default function ConsolePLayout() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const { data: messages } = useListOpenaiMessages(activeId ?? 0, { query: { enabled: !!activeId } });
  const { sendMessage, isStreaming, isTyping, streamingMessage } = useChat(activeId, setActiveId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingMessage, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim(), "chat");
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#07080f] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/8 bg-[#0a0912]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-sm">Dl</span>
          </div>
          <span className="text-xl text-gradient-premium font-normal" style={{ fontFamily: "'Dancing Script', cursive" }}>Deliule</span>
        </div>
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#003087]" fill="currentColor">
            <path d="M8.985 2.596v17.548l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.181.762.814.762 1.505v4.96c2.313 1.291 4.035-.08 4.035-2.955 0-2.95-1.008-4.334-3.947-5.286-1.156-.37-3.416-.969-5.559-1.315M0 17.32v-3.634c.848.547 2.55 1.177 3.67 1.177 1.184 0 1.793-.479 1.793-1.185 0-.729-.47-1.072-2.04-1.753C1.118 11.084 0 9.94 0 8.071c0-2.469 1.695-4.095 4.578-4.534v-1.39l1.73.556V4.15c1.187.225 2.186.546 3.014.903v3.47c-.685-.419-2.046-.966-3.317-.966-1.125 0-1.73.428-1.73 1.093 0 .657.497 1.019 2.07 1.7 2.386 1.04 3.44 2.234 3.44 4.199 0 2.521-1.618 4.095-4.74 4.453L0 17.32z"/>
          </svg>
          <span className="text-xs uppercase tracking-widest text-[#003087]/80">PlayStation</span>
        </div>
        <button
          onClick={() => setActiveId(null)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-white/10 hover:border-[#003087]/40 text-white/50 hover:text-white transition-all text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 pt-6 pb-44">
        {!activeId && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-in fade-in duration-500">
            <div className="w-20 h-20 mb-6 rounded-3xl bg-[#003087]/20 border-2 border-[#003087]/30 flex items-center justify-center shadow-2xl shadow-[#003087]/20">
              <div className="grid grid-cols-2 gap-1.5">
                <span className="text-blue-400 text-sm font-bold">□</span>
                <span className="text-red-400 text-sm font-bold">△</span>
                <span className="text-blue-500 text-sm font-bold">✕</span>
                <span className="text-pink-400 text-sm font-bold">○</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gradient-premium mb-3" style={{ fontFamily: "'Dancing Script', cursive" }}>Deliule</h2>
            <p className="text-white/30 text-lg">Press <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600/80 text-white text-xs font-bold">✕</span> to send</p>
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          {messages?.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role as "user" | "assistant"} content={msg.content} createdAt={msg.createdAt} />
          ))}
          {isTyping && (
            <div className="flex w-full mb-6 justify-start">
              <div className="px-6 py-4 rounded-2xl bg-card border-2 border-card-border rounded-bl-sm animate-in fade-in">
                <div className="flex gap-2">
                  {[0, 150, 300].map(d => <span key={d} className="w-3 h-3 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </div>
              </div>
            </div>
          )}
          {isStreaming && streamingMessage && (
            <ChatMessage role="assistant" content={streamingMessage} isStreaming={true} />
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0912] border-t border-white/8">
        <div className="max-w-4xl mx-auto px-8 py-5">
          <div className="flex items-center gap-3 mb-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border-2 border-white/10 focus:border-[#003087]/50 rounded-2xl px-6 py-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors"
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-14 h-14 rounded-2xl bg-[#003087] flex items-center justify-center shadow-lg shadow-[#003087]/30 disabled:opacity-30 transition-all hover:brightness-125 active:scale-95"
            >
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <PSHint symbol="✕" color="text-blue-400" bg="bg-blue-900/60" text="Send" />
            <PSHint symbol="○" color="text-pink-400" bg="bg-pink-900/60" text="Clear" />
            <PSHint symbol="□" color="text-blue-300" bg="bg-blue-800/50" text="New chat" />
            <PSHint symbol="△" color="text-green-400" bg="bg-green-900/50" text="History" />
          </div>
        </div>
      </div>
    </div>
  );
}
