import { MessageSquare, Trash2, Plus } from "lucide-react";
import { useListOpenaiConversations, useDeleteOpenaiConversation, getListOpenaiConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatSidebarProps {
  activeId: number | null;
  onSelect: (id: number | null) => void;
}

export function ChatSidebar({ activeId, onSelect }: ChatSidebarProps) {
  const { data: rawConversations, isLoading } = useListOpenaiConversations();
  const conversations = Array.isArray(rawConversations) ? rawConversations : [];
  const deleteConv = useDeleteOpenaiConversation();
  const queryClient = useQueryClient();

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await deleteConv.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
    if (activeId === id) onSelect(null);
  };

  return (
    <div className="w-72 border-r border-border bg-sidebar flex flex-col h-full">
      <div className="p-4">
        <Button
          onClick={() => onSelect(null)}
          className="w-full justify-start gap-2 bg-gradient-premium border-none text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 pb-4">
          {isLoading && (
            <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                activeId === conv.id
                  ? "bg-accent/20 border-l-2 border-primary"
                  : "hover:bg-accent/10 border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className={`w-4 h-4 shrink-0 ${activeId === conv.id ? "text-primary" : "text-muted-foreground"}`} />
                <div className="truncate text-sm font-medium text-sidebar-foreground">{conv.title}</div>
              </div>
              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-md transition-all shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-premium flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <span className="text-white font-bold text-sm tracking-tight">Dl</span>
          </div>
          <span className="text-gradient-premium text-lg tracking-tight font-normal">Deliule</span>
        </div>
      </div>
    </div>
  );
}
