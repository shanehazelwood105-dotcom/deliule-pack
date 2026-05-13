import { useState, useRef, useEffect } from "react";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { useChat } from "@/hooks/use-chat";
import { useListOpenaiMessages } from "@workspace/api-client-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const [activeId, setActiveId] = useState<number | null>(null);
  
  const { data: messages } = useListOpenaiMessages(activeId ?? 0, {
    query: { enabled: !!activeId }
  });
  
  const { sendMessage, generateImage, isStreaming, isTyping, isGeneratingImage, streamingMessage } = useChat(activeId, setActiveId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, streamingMessage, isTyping]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <ChatSidebar activeId={activeId} onSelect={setActiveId} />
      
      <div className="flex-1 flex flex-col relative h-full">
        {!activeId && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8 text-center animate-in fade-in duration-700">
            <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-premium flex items-center justify-center shadow-xl shadow-primary/20">
              <span className="text-white font-bold text-3xl tracking-tight">Dl</span>
            </div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight text-gradient-premium">
              Deliule
            </h1>
            <p className="text-muted-foreground max-w-md text-lg mb-2">
              How can I help you today?
            </p>
            <p className="text-muted-foreground/60 max-w-md text-sm">
              Start typing below to begin a new conversation.
            </p>
          </div>
        )}

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 md:px-8 pt-8 pb-32"
        >
          <div className="max-w-4xl mx-auto">
            {messages?.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                role={msg.role as "user" | "assistant"} 
                content={msg.content}
                createdAt={msg.createdAt}
              />
            ))}
            
            {isTyping && (
              <div className="flex w-full mb-6 justify-start">
                <div className="px-5 py-4 rounded-2xl bg-card border border-card-border rounded-bl-sm animate-in fade-in">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {isStreaming && streamingMessage && (
              <ChatMessage 
                role="assistant" 
                content={streamingMessage} 
                isStreaming={true}
              />
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-background via-background to-transparent pt-12">
          <ChatInput onSend={(msg, mode, file) => sendMessage(msg, mode, file)} onGenerateImage={generateImage} disabled={isTyping} isGeneratingImage={isGeneratingImage} />
        </div>
      </div>
    </div>
  );
}
