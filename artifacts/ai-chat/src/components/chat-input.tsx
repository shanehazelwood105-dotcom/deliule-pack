import { useState, useRef, useEffect } from "react";
import { Send, ImageIcon, X, Loader2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type InputMode = "chat" | "image" | "code";

interface ChatInputProps {
  onSend: (message: string, mode: InputMode) => void;
  onGenerateImage: (prompt: string) => void;
  disabled?: boolean;
  isGeneratingImage?: boolean;
}

export function ChatInput({ onSend, onGenerateImage, disabled, isGeneratingImage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<InputMode>("chat");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [mode]);

  const handleSend = () => {
    if (!message.trim() || disabled || isGeneratingImage) return;
    if (mode === "image") {
      onGenerateImage(message.trim());
    } else {
      onSend(message.trim(), mode);
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

  const setModeOrToggle = (next: InputMode) => {
    setMode(prev => prev === next ? "chat" : next);
    setMessage("");
  };

  const isDisabled = disabled || isGeneratingImage;

  const borderClass =
    mode === "image" ? "border-purple-500/50 focus-within:ring-purple-500/50" :
    mode === "code"  ? "border-cyan-500/50 focus-within:ring-cyan-500/50" :
    "border-input focus-within:ring-primary/50";

  const placeholder =
    mode === "image" ? "Describe the image you want..." :
    mode === "code"  ? "Describe the code you need..." :
    "Type a message...";

  return (
    <div className={`relative flex items-end w-full max-w-4xl mx-auto border bg-card rounded-2xl shadow-lg transition-all focus-within:ring-1 ${borderClass}`}>
      {mode !== "chat" && (
        <div className="absolute -top-8 left-0 flex items-center gap-1.5">
          <div className={`flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1 rounded-full shadow ${
            mode === "code" ? "bg-cyan-600" : "bg-gradient-premium"
          }`}>
            {mode === "code" ? <Code2 className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
            {mode === "code" ? "Codex mode" : "Image mode"}
          </div>
        </div>
      )}

      <div className="flex shrink-0 m-2 gap-1">
        <button
          type="button"
          onClick={() => setModeOrToggle("image")}
          className={`p-2 rounded-xl transition-all ${
            mode === "image"
              ? "bg-gradient-premium text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
          }`}
          title={mode === "image" ? "Back to chat" : "Generate an image"}
        >
          {mode === "image" ? <X className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => setModeOrToggle("code")}
          className={`p-2 rounded-xl transition-all ${
            mode === "code"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
          }`}
          title={mode === "code" ? "Back to chat" : "Ask Codex for code"}
        >
          {mode === "code" ? <X className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
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
                ? mode === "code"
                  ? "bg-cyan-600 hover:bg-cyan-500 hover:scale-105 shadow-md text-white"
                  : "bg-gradient-premium hover:scale-105 shadow-md shadow-primary/20 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {mode === "image" ? <ImageIcon className="w-4 h-4" /> :
             mode === "code"  ? <Code2 className="w-4 h-4" /> :
             <Send className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
