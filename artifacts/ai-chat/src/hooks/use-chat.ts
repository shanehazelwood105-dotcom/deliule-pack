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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const queryClient = useQueryClient();

  const createConv = useCreateOpenaiConversation();

  const ensureConversation = useCallback(async (title: string) => {
    if (conversationId) return conversationId;
    const newConv = await createConv.mutateAsync({ data: { title: title.slice(0, 40) + (title.length > 40 ? "..." : "") } });
    onConversationCreated(newConv.id);
    queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
    return newConv.id;
  }, [conversationId, createConv, onConversationCreated, queryClient]);

  const sendMessage = useCallback(async (content: string) => {
    const targetId = await ensureConversation(content);

    const tempUserMessage = {
      id: Date.now(),
      conversationId: targetId,
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };

    queryClient.setQueryData(getListOpenaiMessagesQueryKey(targetId), (old: unknown) => {
      const arr = Array.isArray(old) ? old : [];
      return [...arr, tempUserMessage];
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
              if (data.done) break;
            } catch {
              // ignore parse errors for partial chunks
            }
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(targetId) });
      setIsStreaming(false);
      setStreamingMessage("");
    } catch {
      setIsTyping(false);
      setIsStreaming(false);
    }
  }, [ensureConversation, queryClient]);

  const generateImage = useCallback(async (prompt: string) => {
    const targetId = await ensureConversation(`Image: ${prompt}`);

    setIsGeneratingImage(true);

    const tempUserMessage = {
      id: Date.now(),
      conversationId: targetId,
      role: "user",
      content: `Generate an image: ${prompt}`,
      createdAt: new Date().toISOString()
    };
    queryClient.setQueryData(getListOpenaiMessagesQueryKey(targetId), (old: unknown) => {
      const arr = Array.isArray(old) ? old : [];
      return [...arr, tempUserMessage];
    });

    try {
      const response = await fetch(`/api/openai/conversations/${targetId}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Image generation failed");

      queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(targetId) });
    } catch {
      // silently fail, user will see no image
    } finally {
      setIsGeneratingImage(false);
    }
  }, [ensureConversation, queryClient]);

  return { sendMessage, generateImage, isStreaming, isTyping, isGeneratingImage, streamingMessage };
}
