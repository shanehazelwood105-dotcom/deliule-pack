import { useState, useRef, useEffect } from "react";
import { Send, ImageIcon, X, Loader2, Code2, MoreHorizontal, Paperclip, Music2, Film, Box, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export type InputMode = "chat" | "image" | "code" | "music" | "video" | "3d" | "project";

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

const MODE_META: Record<InputMode, { label: string; color: string; badge: string }> = {
  chat:    { label: "Chat",           color: "",                                badge: "" },
  image:   { label: "Image mode",     color: "bg-gradient-premium",             badge: "text-violet-300" },
  code:    { label: "Code mode",      color: "bg-cyan-600",                     badge: "text-cyan-300" },
  music:   { label: "Music mode",     color: "bg-gradient-to-r from-fuchsia-600 to-violet-600", badge: "text-fuchsia-300" },
  video:   { label: "Video Script",   color: "bg-gradient-to-r from-rose-600 to-orange-500",    badge: "text-rose-300" },
  "3d":    { label: "3D mode",        color: "bg-gradient-to-r from-cyan-600 to-teal-500",      badge: "text-cyan-300" },
  project: { label: "Project mode",   color: "bg-gradient-to-r from-emerald-600 to-green-500",  badge: "text-emerald-300" },
};

const MODE_ICONS: Record<InputMode, React.ReactNode> = {
  chat:    null,
  image:   <ImageIcon className="w-4 h-4" />,
  code:    <Code2 className="w-4 h-4" />,
  music:   <Music2 className="w-4 h-4" />,
  video:   <Film className="w-4 h-4" />,
  "3d":    <Box className="w-4 h-4" />,
  project: <FolderOpen className="w-4 h-4" />,
};

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
    const isImg = file.type.startsWith("image/");
    const reader = new FileReader();
    if (isImg) {
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
  const meta = MODE_META[mode];

  const borderClass =
    mode === "image"   ? "border-violet-500/50 focus-within:ring-violet-500/40" :
    mode === "code"    ? "border-cyan-500/50 focus-within:ring-cyan-500/40" :
    mode === "music"   ? "border-fuchsia-500/50 focus-within:ring-fuchsia-500/40" :
    mode === "video"   ? "border-rose-500/50 focus-within:ring-rose-500/40" :
    mode === "3d"      ? "border-cyan-400/50 focus-within:ring-cyan-400/40" :
    mode === "project" ? "border-emerald-500/50 focus-within:ring-emerald-500/40" :
    "border-input focus-within:ring-primary/50";

  const placeholder =
    mode === "image"   ? "Describe the image you want..." :
    mode === "code"    ? "Describe the code you need..." :
    mode === "music"   ? "Describe the music (e.g. jazz piano, epic orchestral, lo-fi beats)..." :
    mode === "video"   ? "Describe your video concept..." :
    mode === "3d"      ? "Describe the 3D scene you want to see..." :
    mode === "project" ? "Describe the project to generate..." :
    attachedFile       ? "Add a message (optional)..." :
    "Type a message...";

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {mode !== "chat" && (
        <div className="absolute -top-8 left-0 flex items-center gap-1.5">
          <div className={`flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1 rounded-full shadow ${meta.color}`}>
            {MODE_ICONS[mode]}
            {meta.label}
            <button onClick={() => selectMode(mode)} className="ml-1 opacity-70 hover:opacity-100">
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
          <button onClick={() => setAttachedFile(null)} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className={`relative flex items-end w-full border bg-card rounded-2xl shadow-lg transition-all focus-within:ring-1 ${borderClass}`}>
        <div className="relative shrink-0 m-2" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            className={`p-2 rounded-xl transition-all ${menuOpen ? "bg-accent/30 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/20"}`}
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl bg-popover border border-border shadow-xl overflow-hidden z-50">
              <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Generate</div>
              {(["image", "music", "video"] as InputMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMode(m)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${mode === m ? `bg-accent/20 ${MODE_META[m].badge}` : "text-foreground hover:bg-accent/20"}`}
                >
                  {MODE_ICONS[m]}
                  <span>{MODE_META[m].label.replace(" mode", "").replace(" Script", "")}</span>
                  {mode === m && <span className="ml-auto text-xs opacity-50">on</span>}
                </button>
              ))}

              <div className="border-t border-border my-0.5" />
              <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Create</div>
              {(["3d", "project", "code"] as InputMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMode(m)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${mode === m ? `bg-accent/20 ${MODE_META[m].badge}` : "text-foreground hover:bg-accent/20"}`}
                >
                  {MODE_ICONS[m]}
                  <span>{MODE_META[m].label.replace(" mode", "").replace(" Script", "")}</span>
                  {mode === m && <span className="ml-auto text-xs opacity-50">on</span>}
                </button>
              ))}

              <div className="border-t border-border my-0.5" />
              <button
                type="button"
                onClick={() => { fileInputRef.current?.click(); setMenuOpen(false); }}
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
                  ? mode === "code"    ? "bg-cyan-600 hover:bg-cyan-500 hover:scale-105 shadow-md text-white"
                  : mode === "music"   ? "bg-gradient-to-br from-fuchsia-600 to-violet-600 hover:scale-105 shadow-md text-white"
                  : mode === "video"   ? "bg-gradient-to-br from-rose-600 to-orange-500 hover:scale-105 shadow-md text-white"
                  : mode === "3d"      ? "bg-gradient-to-br from-cyan-600 to-teal-500 hover:scale-105 shadow-md text-white"
                  : mode === "project" ? "bg-gradient-to-br from-emerald-600 to-green-500 hover:scale-105 shadow-md text-white"
                  : "bg-gradient-premium hover:scale-105 shadow-md shadow-primary/20 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {MODE_ICONS[mode] ?? <Send className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
