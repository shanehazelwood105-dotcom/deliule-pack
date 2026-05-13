import { useState, useRef, useEffect } from "react";
import { Send, ImageIcon, X, Loader2, Code2, MoreHorizontal, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

export type InputMode = "chat" | "image" | "code";

interface AttachedFile {
  name: string;
  type: "image" | "text";
  preview?: string;
  content: string;
}

interface ChatInputProps {
  onSend: (message: string, mode: InputMode, file?: AttachedFile) => void;
  onGenerateImage: (prompt: string) => void;
  disabled?: boolean;
  isGeneratingImage?: boolean;
}

export function ChatInput({ onSend, onGenerateImage, disabled, isGeneratingImage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<InputMode>("chat");
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSend = () => {
    if ((!message.trim() && !attachedFile) || disabled || isGeneratingImage) return;
    if (mode === "image") {
      onGenerateImage(message.trim());
    } else {
      onSend(message.trim(), mode, attachedFile ?? undefined);
    }
    setMessage("");
    setAttachedFile(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectMode = (next: InputMode) => {
    setMode(prev => prev === next ? "chat" : next);
    setMessage("");
    setAttachedFile(null);
    setMenuOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMenuOpen(false);
    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();
    if (isImage) {
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setAttachedFile({ name: file.name, type: "image", preview: dataUrl, content: dataUrl });
        setMode("chat");
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setAttachedFile({ name: file.name, type: "text", content: text });
        setMode("chat");
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  };

  const isDisabled = disabled || isGeneratingImage;
  const canSend = (message.trim() || !!attachedFile) && !isDisabled;

  const borderClass =
    mode === "image" ? "border-purple-500/50 focus-within:ring-purple-500/50" :
    mode === "code"  ? "border-cyan-500/50 focus-within:ring-cyan-500/50" :
    "border-input focus-within:ring-primary/50";

  const placeholder =
    mode === "image" ? "Describe the image you want..." :
    mode === "code"  ? "Describe the code you need..." :
    attachedFile ? "Add a message (optional)..." :
    "Type a message...";

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {mode !== "chat" && (
        <div className="absolute -top-8 left-0 flex items-center gap-1.5">
          <div className={`flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1 rounded-full shadow ${
            mode === "code" ? "bg-cyan-600" : "bg-gradient-premium"
          }`}>
            {mode === "code" ? <Code2 className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
            {mode === "code" ? "Codex mode" : "Image mode"}
            <button
              onClick={() => selectMode(mode)}
              className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {attachedFile && (
        <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-input text-sm">
          {attachedFile.type === "image" ? (
            <img src={attachedFile.preview} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center shrink-0">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <span className="truncate text-muted-foreground flex-1">{attachedFile.name}</span>
          <button
            onClick={() => setAttachedFile(null)}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className={`relative flex items-end w-full border bg-card rounded-2xl shadow-lg transition-all focus-within:ring-1 ${borderClass}`}>
        <div className="relative shrink-0 m-2" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            className={`p-2 rounded-xl transition-all ${
              menuOpen
                ? "bg-accent/30 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
            }`}
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl bg-popover border border-border shadow-xl overflow-hidden z-50">
              <button
                type="button"
                onClick={() => selectMode("image")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  mode === "image"
                    ? "bg-purple-500/15 text-purple-400"
                    : "text-foreground hover:bg-accent/20"
                }`}
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span>Generate Image</span>
                {mode === "image" && <span className="ml-auto text-xs opacity-60">active</span>}
              </button>
              <button
                type="button"
                onClick={() => selectMode("code")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  mode === "code"
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "text-foreground hover:bg-accent/20"
                }`}
              >
                <Code2 className="w-4 h-4 shrink-0" />
                <span>Code Mode</span>
                {mode === "code" && <span className="ml-auto text-xs opacity-60">active</span>}
              </button>
              <div className="border-t border-border my-0.5" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-accent/20 transition-colors"
              >
                <Paperclip className="w-4 h-4 shrink-0" />
                <span>Upload File</span>
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,text/*,.pdf,.json,.csv,.md,.ts,.tsx,.js,.jsx,.py,.rs,.go,.java,.cpp,.c,.html,.css"
          className="hidden"
          onChange={handleFileChange}
        />

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
              disabled={!canSend}
              data-testid="button-send"
              className={`rounded-xl h-10 w-10 transition-all ${
                canSend
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
    </div>
  );
}
