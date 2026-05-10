import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateOpenaiConversation,
  getListOpenaiMessagesQueryKey,
  getListOpenaiConversationsQueryKey
} from "@workspace/api-client-react";

export function useChat(conversationId: number | null, onConversationCreated: (id: number) => void) {
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();

  const createConv = useCreateOpenaiConversation();

  const sendMessage = useCallback(async (content: string) => {
    let targetId = conversationId;
    if (!targetId) {
      const newConv = await createConv.mutateAsync({ data: { title: content.slice(0, 40) + (content.length > 40 ? "..." : "") } });
      targetId = newConv.id;
      onConversationCreated(targetId);
      queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
    }

    const tempUserMessage = {
      id: Date.now(),
      conversationId: targetId,
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };

    queryClient.setQueryData(getListOpenaiMessagesQueryKey(targetId), (old: any) => {
      if (!old) return [tempUserMessage];
      return [...old, tempUserMessage];
    });

    setIsTyping(true);
    setStreamingMessage("");

    try {
      const response = await fetch(`/api/openai/conversations/${targetId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      setIsTyping(false);
      setIsStreaming(true);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr.trim() === "[DONE]") continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                fullResponse += data.content;
                setStreamingMessage(fullResponse);
              }
              if (data.done) {
                break;
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(targetId) });
      setIsStreaming(false);
      setStreamingMessage("");
    } catch (e) {
      console.error(e);
      setIsTyping(false);
      setIsStreaming(false);
    }
  }, [conversationId, createConv, queryClient, onConversationCreated]);

  return { sendMessage, isStreaming, isTyping, streamingMessage };
}
