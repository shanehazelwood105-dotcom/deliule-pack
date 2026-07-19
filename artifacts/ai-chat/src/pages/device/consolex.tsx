import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw } from "lucide-react";
import { ChatMessage } from "@/components/chat-message";
import { useChat } from "@/hooks/use-chat";
import { useListOpenaiMessages } from "@workspace/api-client-react";

function XboxHint({ label, color, text }: { label: string; color: string; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shadow-md`}>{label}</div>
      <span className="text-white/30 text-xs">{text}</span>
    </div>
  );
}

export default function ConsoleXLayout() {
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
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/8 bg-[#090a16]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-sm">Dl</span>
          </div>
          <span className="text-xl text-gradient-premium font-normal" style={{ fontFamily: "'Dancing Script', cursive" }}>Deliule</span>
        </div>
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#107c10]" fill="currentColor">
            <path d="M4.102 21.033C6.211 22.881 9.05 24 12 24s5.789-1.12 7.898-2.967c1.178-1.034.27-2.377-.978-2.377-.646 0-1.222.314-1.822.628-.934.487-1.95 1.03-3.098 1.03-1.148 0-2.164-.543-3.098-1.03-.6-.314-1.176-.628-1.822-.628-1.248 0-2.156 1.343-.978 2.377zM20.47 3.56C18.313 1.34 15.3 0 12 0S5.688 1.34 3.53 3.56c-2.72 2.899-1.91 6.455 2.437 6.455.935 0 1.9-.344 2.813-.873C10.154 8.34 11.076 8 12 8c.924 0 1.846.34 3.22 1.142.913.53 1.878.873 2.813.873 4.347 0 5.157-3.556 2.437-6.455z"/>
          </svg>
          <span className="text-xs uppercase tracking-widest text-[#107c10]/80">Xbox</span>
        </div>
        <button
          onClick={() => setActiveId(null)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-white/10 hover:border-[#107c10]/40 text-white/50 hover:text-white transition-all text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 pt-6 pb-44">
        {!activeId && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-in fade-in duration-500">
            <div className="w-20 h-20 mb-6 rounded-3xl bg-[#107c10]/20 border-2 border-[#107c10]/30 flex items-center justify-center shadow-2xl shadow-[#107c10]/20">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#107c10]" fill="currentColor">
                <path d="M4.102 21.033C6.211 22.881 9.05 24 12 24s5.789-1.12 7.898-2.967c1.178-1.034.27-2.377-.978-2.377-.646 0-1.222.314-1.822.628-.934.487-1.95 1.03-3.098 1.03-1.148 0-2.164-.543-3.098-1.03-.6-.314-1.176-.628-1.822-.628-1.248 0-2.156 1.343-.978 2.377zM20.47 3.56C18.313 1.34 15.3 0 12 0S5.688 1.34 3.53 3.56c-2.72 2.899-1.91 6.455 2.437 6.455.935 0 1.9-.344 2.813-.873C10.154 8.34 11.076 8 12 8c.924 0 1.846.34 3.22 1.142.913.53 1.878.873 2.813.873 4.347 0 5.157-3.556 2.437-6.455z"/>
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gradient-premium mb-3" style={{ fontFamily: "'Dancing Script', cursive" }}>Deliule</h2>
            <p className="text-white/30 text-lg">Press <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold">A</span> to send</p>
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

      <div className="fixed bottom-0 left-0 right-0 bg-[#090a16] border-t border-white/8">
        <div className="max-w-4xl mx-auto px-8 py-5">
          <div className="flex items-center gap-3 mb-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border-2 border-white/10 focus:border-[#107c10]/50 rounded-2xl px-6 py-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors"
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-14 h-14 rounded-2xl bg-[#107c10] flex items-center justify-center shadow-lg shadow-[#107c10]/30 disabled:opacity-30 transition-all hover:brightness-110 active:scale-95"
            >
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <XboxHint label="A" color="bg-green-600" text="Send" />
            <XboxHint label="B" color="bg-red-600" text="Clear" />
            <XboxHint label="Y" color="bg-yellow-600" text="New chat" />
            <XboxHint label="X" color="bg-blue-600" text="History" />
          </div>
        </div>
      </div>
    </div>
  );
}
