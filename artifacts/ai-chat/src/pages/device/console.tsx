import { useState, useRef, useEffect } from "react";
import { Send, Plus, Gamepad2, RotateCcw } from "lucide-react";
import { ChatMessage } from "@/components/chat-message";
import { useChat } from "@/hooks/use-chat";
import { useListOpenaiMessages } from "@workspace/api-client-react";

function ControllerHint({ label, color, text }: { label: string; color: string; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shadow-md`}>{label}</div>
      <span className="text-white/30 text-xs">{text}</span>
    </div>
  );
}

export default function ConsoleLayout() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const { data: messages } = useListOpenaiMessages(activeId ?? 0, { query: { enabled: !!activeId } });
  const { sendMessage, isStreaming, isTyping, streamingMessage } = useChat(activeId, setActiveId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingMessage, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim(), "chat");
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/8 bg-[#0a0a14]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-sm">Dl</span>
          </div>
          <span className="text-xl text-gradient-premium font-normal" style={{ fontFamily: "'Dancing Script', cursive" }}>Deliule</span>
        </div>
        <div className="flex items-center gap-2 text-white/20">
          <Gamepad2 className="w-5 h-5" />
          <span className="text-xs uppercase tracking-widest">Console Mode</span>
        </div>
        <button
          onClick={() => setActiveId(null)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-white/10 hover:border-white/20 text-white/50 hover:text-white transition-all text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 pt-6 pb-44">
        {!activeId && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-in fade-in duration-500">
            <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-premium flex items-center justify-center shadow-2xl shadow-primary/30">
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gradient-premium mb-3" style={{ fontFamily: "'Dancing Script', cursive" }}>Deliule</h2>
            <p className="text-white/30 text-lg">Press <kbd className="bg-white/10 px-2 py-0.5 rounded text-white/50 font-mono text-sm">Enter</kbd> to start chatting</p>
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

      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a14] border-t border-white/8">
        <div className="max-w-4xl mx-auto px-8 py-5">
          <div className="flex items-center gap-3 mb-3">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border-2 border-white/10 focus:border-primary/50 rounded-2xl px-6 py-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors"
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-14 h-14 rounded-2xl bg-gradient-premium flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <ControllerHint label="A" color="bg-green-600" text="Send" />
            <ControllerHint label="B" color="bg-red-600" text="Clear" />
            <ControllerHint label="Y" color="bg-yellow-600" text="New chat" />
            <ControllerHint label="X" color="bg-blue-600" text="History" />
          </div>
        </div>
      </div>
    </div>
  );
}
