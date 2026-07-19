import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

interface DdgResult {
  Text: string;
  FirstURL: string;
  Icon?: { URL: string };
}

interface DdgResponse {
  AbstractText?: string;
  AbstractURL?: string;
  AbstractSource?: string;
  Answer?: string;
  RelatedTopics?: Array<DdgResult | { Name: string; Topics: DdgResult[] }>;
  Results?: DdgResult[];
  Infobox?: {
    content?: Array<{ label: string; value: string }>;
    meta?: Array<{ label: string; value: string }>;
  };
}

router.get("/search", async (req, res) => {
  const q = String(req.query["q"] ?? "").trim();
  if (!q) {
    res.status(400).json({ error: "Missing query parameter: q" });
    return;
  }

  try {
    const [ddgRes, aiCompletion] = await Promise.all([
      fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1&t=SearchScraper`)
        .then(r => r.json() as Promise<DdgResponse>)
        .catch(() => ({} as DdgResponse)),

      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Del Scraper, a smart AI integrated into the Search Scraper search engine. When given a search query, provide:
1. A concise, helpful direct answer (2-4 sentences)
2. 4-6 relevant web result suggestions with realistic titles, URLs, and snippets

Respond ONLY with valid JSON in this exact shape:
{
  "answer": "...",
  "suggestions": [
    { "title": "...", "url": "https://...", "snippet": "..." }
  ]
}`,
          },
          { role: "user", content: q },
        ],
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    ]);

    let aiAnswer = "";
    let aiSuggestions: Array<{ title: string; url: string; snippet: string }> = [];
    try {
      const parsed = JSON.parse(aiCompletion.choices[0]?.message?.content ?? "{}");
      aiAnswer = parsed.answer ?? "";
      aiSuggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    } catch {
      aiAnswer = aiCompletion.choices[0]?.message?.content ?? "";
    }

    const flatTopics: DdgResult[] = [];
    for (const item of ddgRes.RelatedTopics ?? []) {
      if ("Topics" in item) {
        flatTopics.push(...item.Topics);
      } else {
        flatTopics.push(item as DdgResult);
      }
    }

    const webResults = [
      ...(ddgRes.Results ?? []).map(r => ({
        title: r.Text.split(" - ")[0] ?? r.Text.slice(0, 60),
        url: r.FirstURL,
        snippet: r.Text,
        favicon: r.Icon?.URL ?? "",
        source: "web",
      })),
      ...flatTopics.slice(0, 6).map(r => ({
        title: r.Text.split(" - ")[0] ?? r.Text.slice(0, 60),
        url: r.FirstURL,
        snippet: r.Text,
        favicon: r.Icon?.URL ?? "",
        source: "related",
      })),
      ...aiSuggestions.map(s => ({
        title: s.title,
        url: s.url,
        snippet: s.snippet,
        favicon: "",
        source: "ai",
      })),
    ].slice(0, 10);

    res.json({
      query: q,
      aiAnswer,
      abstract: ddgRes.AbstractText ?? "",
      abstractUrl: ddgRes.AbstractURL ?? "",
      abstractSource: ddgRes.AbstractSource ?? "",
      directAnswer: ddgRes.Answer ?? "",
      results: webResults,
    });
  } catch (err) {
    req.log.error({ err }, "Search failed");
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
