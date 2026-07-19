import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useListOpenaiMessages } from "@workspace/api-client-react";

export default function WatchLayout() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const { data: messages } = useListOpenaiMessages(activeId ?? 0, { query: { enabled: !!activeId } });
  const { sendMessage, isStreaming, isTyping, streamingMessage } = useChat(activeId, setActiveId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingMessage, isTyping]);

  const lastMsg = messages?.[messages.length - 1];
  const displayText = isStreaming ? streamingMessage : (lastMsg?.role === "assistant" ? lastMsg.content : "");

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim(), "chat");
    setInput("");
  };

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden" style={{ maxWidth: "280px", margin: "0 auto" }}>
      <div className="w-full h-full rounded-[40px] border-4 border-zinc-800 bg-[#0a0a0c] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 pt-5 pb-2 shrink-0">
          <span className="text-white/80 font-medium" style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1rem" }}>Deliule</span>
          <button onClick={() => { setActiveId(null); setInput(""); }} className="text-white/30 hover:text-white/60 transition-colors">
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-1 space-y-2">
          {!activeId && !isTyping && (
            <p className="text-white/30 text-[10px] text-center mt-4">Ask anything...</p>
          )}
          {messages?.slice(-3).map((msg) => (
            <div key={msg.id} className={`text-[10px] leading-relaxed rounded-lg px-2 py-1.5 ${msg.role === "user" ? "bg-violet-600/70 text-white ml-4" : "bg-white/8 text-white/70 mr-4"}`}>
              {msg.content.slice(0, 120)}{msg.content.length > 120 ? "..." : ""}
            </div>
          ))}
          {isTyping && (
            <div className="bg-white/8 rounded-lg px-2 py-1.5 mr-4 flex gap-1">
              {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          )}
          {isStreaming && streamingMessage && (
            <div className="bg-white/8 text-white/70 rounded-lg px-2 py-1.5 mr-4 text-[10px] leading-relaxed">
              {streamingMessage.slice(0, 120)}...
              <span className="inline-block w-1 h-2.5 ml-0.5 bg-violet-400 animate-pulse align-middle" />
            </div>
          )}
        </div>

        <div className="px-3 pb-5 pt-2 flex items-center gap-1.5 shrink-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Message..."
            className="flex-1 bg-white/8 border border-white/10 rounded-full px-3 py-1.5 text-[10px] text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center disabled:opacity-30 transition-all active:scale-90"
          >
            <Send className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
