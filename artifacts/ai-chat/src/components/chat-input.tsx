import { useState, useRef, useEffect } from "react";
import { Send, ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  onGenerateImage: (prompt: string) => void;
  disabled?: boolean;
  isGeneratingImage?: boolean;
}

export function ChatInput({ onSend, onGenerateImage, disabled, isGeneratingImage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [imageMode, setImageMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [imageMode]);

  const handleSend = () => {
    if (!message.trim() || disabled || isGeneratingImage) return;
    if (imageMode) {
      onGenerateImage(message.trim());
    } else {
      onSend(message.trim());
    }
    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabled = disabled || isGeneratingImage;

  return (
    <div className={`relative flex items-end w-full max-w-4xl mx-auto border rounded-2xl shadow-lg transition-all ${
      imageMode
        ? "border-purple-500/50 bg-card focus-within:ring-1 focus-within:ring-purple-500/50"
        : "border-input bg-card focus-within:ring-1 focus-within:ring-primary/50"
    }`}>
      {imageMode && (
        <div className="absolute -top-8 left-0 flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 bg-gradient-premium text-white text-xs font-medium px-3 py-1 rounded-full shadow">
            <ImageIcon className="w-3 h-3" />
            Image mode
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => { setImageMode(!imageMode); setMessage(""); }}
        className={`shrink-0 m-2 p-2 rounded-xl transition-all ${
          imageMode
            ? "bg-gradient-premium text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
        }`}
        title={imageMode ? "Switch to chat" : "Generate an image"}
      >
        {imageMode ? <X className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
      </button>

      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={imageMode ? "Describe the image you want..." : "Type a message..."}
        disabled={isDisabled}
        data-testid="input-message"
        className="flex-1 max-h-[200px] min-h-[56px] py-4 pr-14 bg-transparent border-none resize-none focus:outline-none text-sm leading-relaxed"
        rows={1}
      />

      <div className="absolute right-2 bottom-2">
        {isGeneratingImage ? (
          <div className="h-10 w-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : (
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || isDisabled}
            data-testid="button-send"
            className={`rounded-xl h-10 w-10 transition-all ${
              message.trim() && !isDisabled
                ? "bg-gradient-premium hover:scale-105 shadow-md shadow-primary/20 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {imageMode ? <ImageIcon className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
