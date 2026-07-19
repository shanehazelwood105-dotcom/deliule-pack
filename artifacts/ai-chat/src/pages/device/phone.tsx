import { useState, useRef, useEffect } from "react";
import { Menu, X, Plus, MessageSquare, Trash2, ArrowLeft } from "lucide-react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { useChat } from "@/hooks/use-chat";
import { useListOpenaiMessages, useListOpenaiConversations, useDeleteOpenaiConversation, getListOpenaiConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PhoneLayout() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: messages } = useListOpenaiMessages(activeId ?? 0, { query: { enabled: !!activeId } });
  const { sendMessage, generateImage, isStreaming, isTyping, isGeneratingImage, streamingMessage } = useChat(activeId, setActiveId);
  const { data: rawConvs } = useListOpenaiConversations();
  const conversations = Array.isArray(rawConvs) ? rawConvs : [];
  const deleteConv = useDeleteOpenaiConversation();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingMessage, isTyping]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await deleteConv.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
    if (activeId === id) setActiveId(null);
    setDrawerOpen(false);
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden relative">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar shrink-0">
        <button onClick={() => setDrawerOpen(true)} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-premium flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">Dl</span>
          </div>
          <span className="text-gradient-premium font-normal" style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1.2rem" }}>Deliule</span>
        </div>
        <button onClick={() => setActiveId(null)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {drawerOpen && (
        <div className="absolute inset-0 z-50 flex">
          <div className="w-72 bg-sidebar border-r border-border flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-semibold text-sm text-foreground">Conversations</span>
              <button onClick={() => setDrawerOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ScrollArea className="flex-1 px-2 py-2">
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div key={conv.id} onClick={() => { setActiveId(conv.id); setDrawerOpen(false); }}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${activeId === conv.id ? "bg-accent/20 border-l-2 border-primary" : "hover:bg-accent/10 border-l-2 border-transparent"}`}>
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <MessageSquare className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm text-sidebar-foreground">{conv.title}</span>
                    </div>
                    <button onClick={(e) => handleDelete(e, conv.id)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pt-4 pb-28">
        {!activeId && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-500">
            <div className="w-14 h-14 mb-4 rounded-2xl bg-gradient-premium flex items-center justify-center shadow-xl shadow-primary/20">
              <span className="text-white font-bold text-xl">Dl</span>
            </div>
            <h2 className="text-2xl font-bold text-gradient-premium mb-1">Deliule</h2>
            <p className="text-muted-foreground text-sm">How can I help you today?</p>
          </div>
        )}
        {messages?.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role as "user" | "assistant"} content={msg.content} createdAt={msg.createdAt} />
        ))}
        {isTyping && (
          <div className="flex w-full mb-4 justify-start">
            <div className="px-4 py-3 rounded-2xl bg-card border border-card-border rounded-bl-sm animate-in fade-in">
              <div className="flex gap-1.5">
                {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          </div>
        )}
        {isStreaming && streamingMessage && (
          <ChatMessage role="assistant" content={streamingMessage} isStreaming={true} />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <ChatInput onSend={(msg, mode, file) => sendMessage(msg, mode, file)} onGenerateImage={generateImage} disabled={isTyping} isGeneratingImage={isGeneratingImage} />
      </div>
    </div>
  );
}
