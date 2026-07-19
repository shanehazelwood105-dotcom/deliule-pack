import { useState, useRef, useEffect } from "react";
import { Send, Plus, Tv } from "lucide-react";
import { ChatMessage } from "@/components/chat-message";
import { useChat } from "@/hooks/use-chat";
import { useListOpenaiMessages } from "@workspace/api-client-react";

export default function TvLayout() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const { data: messages } = useListOpenaiMessages(activeId ?? 0, { query: { enabled: !!activeId } });
  const { sendMessage, generateImage, isStreaming, isTyping, isGeneratingImage, streamingMessage } = useChat(activeId, setActiveId);
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
    <div className="min-h-screen bg-[#070709] flex flex-col overflow-hidden" style={{ fontSize: "20px" }}>
      <div className="flex items-center justify-between px-16 py-8 border-b border-white/8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-premium flex items-center justify-center shadow-xl shadow-primary/20">
            <span className="text-white font-bold text-xl">Dl</span>
          </div>
          <span className="text-3xl text-gradient-premium font-normal" style={{ fontFamily: "'Dancing Script', cursive" }}>Deliule</span>
        </div>
        <div className="flex items-center gap-3 text-white/30">
          <Tv className="w-6 h-6" />
          <span className="text-sm uppercase tracking-widest">TV Mode</span>
        </div>
        <button
          onClick={() => setActiveId(null)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/10 hover:bg-white/5 text-white/50 hover:text-white transition-all text-base"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-16 pt-10 pb-52">
        {!activeId && (
          <div className="flex flex-col items-center justify-center h-full text-center py-24 animate-in fade-in duration-700">
            <h1 className="text-6xl font-bold text-gradient-premium mb-6" style={{ fontFamily: "'Dancing Script', cursive" }}>Deliule</h1>
            <p className="text-white/40 text-2xl">How can I help you today?</p>
          </div>
        )}
        <div className="max-w-5xl mx-auto">
          {messages?.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role as "user" | "assistant"} content={msg.content} createdAt={msg.createdAt} />
          ))}
          {isTyping && (
            <div className="flex w-full mb-8 justify-start">
              <div className="px-8 py-5 rounded-3xl bg-card border border-card-border rounded-bl-sm animate-in fade-in">
                <div className="flex gap-3">
                  {[0, 150, 300].map(d => <span key={d} className="w-4 h-4 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </div>
              </div>
            </div>
          )}
          {isStreaming && streamingMessage && (
            <ChatMessage role="assistant" content={streamingMessage} isStreaming={true} />
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-16 pb-10 pt-16 bg-gradient-to-t from-[#070709] via-[#070709] to-transparent">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-card border border-border rounded-2xl px-8 py-5 text-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-16 h-16 rounded-2xl bg-gradient-premium flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
