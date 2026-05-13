import { format } from "date-fns";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, createdAt, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";
  const isImage = content.startsWith("data:image/") || content.startsWith("[IMAGE:");

  const imageData = isImage && content.startsWith("data:image/") ? content : null;

  return (
    <div className={`flex w-full mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[80%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        {imageData ? (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-primary/20 animate-in slide-in-from-bottom-2">
            <img
              src={imageData}
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
            <div className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
              {content}
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
              )}
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
