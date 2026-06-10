import { useState, useRef, useCallback } from "react";
import { format } from "date-fns";
import { Play, Square, Music2, Maximize2 } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  isStreaming?: boolean;
}

function WebAudioPlayer({ code }: { code: string }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const play = useCallback(() => {
    try {
      setError("");
      ctxRef.current = new AudioContext();
      const fn = new Function("audioCtx", `${code}\nreturn startMusic(audioCtx);`);
      stopRef.current = fn(ctxRef.current);
      setPlaying(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Playback error");
    }
  }, [code]);

  const stop = useCallback(() => {
    try {
      stopRef.current?.();
    } catch { /* ignore */ }
    try {
      ctxRef.current?.close();
    } catch { /* ignore */ }
    ctxRef.current = null;
    stopRef.current = null;
    setPlaying(false);
  }, []);

  return (
    <div className="my-3 rounded-xl border border-violet-500/25 bg-violet-500/8 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
          <Music2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-violet-300 font-medium uppercase tracking-wider mb-0.5">Generated Music</div>
          <div className="text-xs text-zinc-500">Web Audio API — plays in your browser</div>
        </div>
        <button
          onClick={playing ? stop : play}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            playing
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              : "bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/30"
          }`}
        >
          {playing ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          {playing ? "Stop" : "Play"}
        </button>
      </div>
      {playing && (
        <div className="px-4 pb-3 flex gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full bg-violet-400/60"
              style={{
                height: `${8 + Math.sin(i * 0.8) * 6}px`,
                animationDelay: `${i * 50}ms`,
                animation: "bounce 0.8s ease-in-out infinite alternate",
              }}
            />
          ))}
        </div>
      )}
      {error && <div className="px-4 pb-3 text-xs text-red-400">{error}</div>}
      <style>{`@keyframes bounce { to { transform: scaleY(2.5); } }`}</style>
    </div>
  );
}

function ThreeJSViewer({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="my-3 rounded-xl border border-cyan-500/25 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-cyan-500/8 border-b border-cyan-500/15">
        <span className="text-xs text-cyan-400 font-medium uppercase tracking-wider">3D Scene · Three.js</span>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-zinc-400 hover:text-zinc-200 transition-colors"
          title={expanded ? "Collapse" : "Expand"}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <iframe
        srcDoc={html}
        sandbox="allow-scripts"
        className="w-full bg-black transition-all"
        style={{ height: expanded ? "520px" : "280px", border: "none" }}
        title="Three.js 3D Scene"
      />
    </div>
  );
}

function renderContent(content: string, isStreaming: boolean) {
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++} className="whitespace-pre-wrap">
          {content.slice(lastIndex, match.index)}
        </span>
      );
    }
    const lang = match[1] || "code";
    const code = match[2].trimEnd();

    if (lang === "webaudio") {
      parts.push(<WebAudioPlayer key={key++} code={code} />);
    } else if (lang === "threejs") {
      parts.push(<ThreeJSViewer key={key++} html={code} />);
    } else {
      parts.push(
        <div key={key++} className="my-2 rounded-xl overflow-hidden border border-white/10 text-left">
          <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/10">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">{lang}</span>
          </div>
          <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-emerald-300 bg-black/40">
            <code>{code}</code>
          </pre>
        </div>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={key++} className="whitespace-pre-wrap">
        {content.slice(lastIndex)}
      </span>
    );
  }

  if (parts.length === 0) {
    parts.push(<span key={0} className="whitespace-pre-wrap">{content}</span>);
  }

  return (
    <>
      {parts}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
      )}
    </>
  );
}

export function ChatMessage({ role, content, createdAt, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";
  const isImage = content.startsWith("data:image/");

  return (
    <div className={`flex w-full mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[80%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        {isImage ? (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-primary/20 animate-in slide-in-from-bottom-2">
            <img
              src={content}
              alt="Generated image"
              className="max-w-sm w-full object-cover rounded-2xl"
            />
          </div>
        ) : (
          <div
            className={`px-5 py-3.5 rounded-2xl animate-in slide-in-from-bottom-2 ${
              isUser
                ? "bg-gradient-premium text-white rounded-br-sm shadow-md"
                : "bg-card text-card-foreground border border-card-border rounded-bl-sm shadow-sm"
            }`}
          >
            <div className="text-sm leading-relaxed font-medium">
              {renderContent(content, !!isStreaming)}
            </div>
          </div>
        )}
        {createdAt && (
          <span className="text-[10px] text-muted-foreground mt-1.5 px-1 opacity-60">
            {format(new Date(createdAt), "h:mm a")}
          </span>
        )}
      </div>
    </div>
  );
}
