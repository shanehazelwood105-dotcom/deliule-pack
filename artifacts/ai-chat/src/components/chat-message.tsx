import { format } from "date-fns";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  isStreaming?: boolean;
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
