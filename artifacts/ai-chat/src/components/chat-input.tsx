import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex items-end w-full max-w-4xl mx-auto border border-input bg-card rounded-2xl shadow-lg focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        className="w-full max-h-[200px] min-h-[56px] py-4 pl-5 pr-14 bg-transparent border-none resize-none focus:outline-none text-sm leading-relaxed"
        rows={1}
      />
      <div className="absolute right-2 bottom-2">
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={`rounded-xl h-10 w-10 transition-all ${
            message.trim() && !disabled 
              ? "bg-gradient-premium hover:scale-105 shadow-md shadow-primary/20 text-white" 
              : "bg-muted text-muted-foreground"
          }`}
        >
          {message.trim() ? <Send className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
