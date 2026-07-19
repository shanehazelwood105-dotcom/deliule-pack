import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db, conversations, messages } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
  SendOpenaiMessageParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/conversations", async (req, res) => {
  const sid = req.cookies["deliule_sid"] as string | undefined;
  try {
    const all = await db
      .select()
      .from(conversations)
      .where(sid ? eq(conversations.sessionId, sid) : undefined)
      .orderBy(conversations.createdAt);
    res.json(all);
  } catch (err) {
    req.log.error({ err }, "Failed to list conversations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations", async (req, res) => {
  const parsed = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const sid = req.cookies["deliule_sid"] as string | undefined;
  try {
    const [conv] = await db
      .insert(conversations)
      .values({ title: parsed.data.title, sessionId: sid })
      .returning();
    res.status(201).json(conv);
  } catch (err) {
    req.log.error({ err }, "Failed to create conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id", async (req, res) => {
  const params = GetOpenaiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, params.data.id));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, params.data.id))
      .orderBy(messages.createdAt);
    res.json({ ...conv, messages: msgs });
  } catch (err) {
    req.log.error({ err }, "Failed to get conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/conversations/:id", async (req, res) => {
  const params = DeleteOpenaiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, params.data.id));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    await db.delete(conversations).where(eq(conversations.id, params.data.id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id/messages", async (req, res) => {
  const params = ListOpenaiMessagesParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, params.data.id))
      .orderBy(messages.createdAt);
    res.json(msgs);
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations/:id/messages", async (req, res) => {
  const params = SendOpenaiMessageParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const body = SendOpenaiMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, params.data.id));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    await db.insert(messages).values({
      conversationId: params.data.id,
      role: "user",
      content: body.data.content,
    });

    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, params.data.id))
      .orderBy(messages.createdAt);

    const mode = typeof req.body?.mode === "string" ? req.body.mode : "chat";

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const systemPrompts: Record<string, string> = {
      chat: "You are a helpful, friendly assistant. Keep your replies short and conversational — like texting a smart friend. Avoid bullet points, long explanations, or formal language unless the user specifically asks for detail. Match the user's tone and energy. Get to the point.",
      music: `You are a music composition AI. Generate Web Audio API JavaScript that plays the requested music directly in the browser.

Output a single \`\`\`webaudio code block containing ONLY JavaScript with this exact structure:
\`\`\`webaudio
function startMusic(audioCtx) {
  // your Web Audio API code here — use oscillators, gainNodes, filters, etc.
  // set up scheduling with audioCtx.currentTime
  // return a stop function
  return function stop() {
    // clean up all nodes
  };
}
\`\`\`

Rules:
- Do NOT auto-play. Only define the startMusic function.
- Use audioCtx.currentTime for all scheduling
- Be creative: use multiple oscillators, detuning, envelopes, rhythm
- Keep it under 150 lines
- After the code block, add a short 1-sentence description of the piece.`,
      video: `You are a creative video director AI. Generate a detailed, cinematic video script for the user's request.

Format the script with:
- **SCENE [N]: [TITLE]** headers
- Location, lighting, and mood descriptions
- Camera angles and movements (e.g., "slow dolly in", "wide establishing shot")
- Dialogue in "SPEAKER: line" format if applicable
- [ACTION] beats in brackets
- Duration estimate per scene

Make it vivid, professional, and production-ready.`,
      "3d": `You are a 3D artist AI. Generate self-contained Three.js code that creates and renders a beautiful 3D scene for the user's request.

Output a single \`\`\`threejs code block with complete HTML including Three.js from CDN:
\`\`\`threejs
<!DOCTYPE html>
<html>
<head><style>body{margin:0;background:#000;overflow:hidden}</style></head>
<body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
// Your Three.js scene here
// Must include: scene, camera, renderer, animation loop
</script>
</body>
</html>
\`\`\`

Make it visually impressive: add lighting, materials, rotation/animation. Keep code clean and complete.`,
      project: `You are a senior software architect AI. Generate a complete, production-ready project based on the user's description.

Format your response as:
1. **Project Overview** — what it does and tech stack
2. **File Structure** — a tree of all files
3. For each file, use a fenced code block with the filename as a comment at the top

Be thorough: include config files, entry points, main logic, and a README. Write real, working code — no placeholders.`,
    };

    const systemContent = systemPrompts[mode] ?? systemPrompts["chat"];

    if (mode === "code") {
      const inputMessages = [
        {
          role: "system" as const,
          content: "You are an expert software engineer powered by Codex. Write clean, well-commented code. When providing code, always wrap it in appropriate markdown code blocks with the language specified. Be concise but complete.",
        },
        ...history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const stream = await openai.responses.create({
        model: "gpt-5.3-codex",
        input: inputMessages,
        stream: true,
      } as Parameters<typeof openai.responses.create>[0]);

      for await (const event of stream as AsyncIterable<{ type: string; delta?: string }>) {
        if (event.type === "response.output_text.delta" && event.delta) {
          fullResponse += event.delta;
          res.write(`data: ${JSON.stringify({ content: event.delta })}\n\n`);
        }
      }
    } else {
      const chatMessages = [
        { role: "system" as const, content: systemContent },
        ...history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const maxTokens = mode === "project" ? 4096 : mode === "3d" || mode === "music" ? 2048 : 512;

      const stream = await openai.chat.completions.create({
        model: "gpt-5.4",
        max_completion_tokens: maxTokens,
        messages: chatMessages,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
    }

    await db.insert(messages).values({
      conversationId: params.data.id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

router.post("/conversations/:id/generate-image", async (req, res) => {
  const params = GetOpenaiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  try {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, params.data.id));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    await db.insert(messages).values({
      conversationId: params.data.id,
      role: "user",
      content: `Generate an image: ${prompt}`,
    });

    const buffer = await generateImageBuffer(prompt, "1024x1024", "low");
    const base64 = `data:image/png;base64,${buffer.toString("base64")}`;

    const [saved] = await db.insert(messages).values({
      conversationId: params.data.id,
      role: "assistant",
      content: base64,
    }).returning();

    res.json({ messageId: saved.id, imageData: base64 });
  } catch (err) {
    req.log.error({ err }, "Failed to generate image");
    res.status(500).json({ error: "Image generation failed" });
  }
});

export default router;
