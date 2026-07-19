import { useState, useEffect, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { Search, Sparkles, ExternalLink, ArrowLeft, Loader2, Globe } from "lucide-react";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  favicon: string;
  source: "web" | "related" | "ai";
}

interface SearchResponse {
  query: string;
  aiAnswer: string;
  abstract: string;
  abstractUrl: string;
  abstractSource: string;
  directAnswer: string;
  results: SearchResult[];
}

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

function FaviconImg({ url, domain }: { url: string; domain: string }) {
  const [error, setError] = useState(false);
  if (!url || error) {
    return (
      <div className="w-4 h-4 rounded-sm bg-white/8 flex items-center justify-center text-[8px] text-muted-foreground shrink-0">
        {domain.slice(0, 1).toUpperCase()}
      </div>
    );
  }
  return <img src={url.startsWith("//") ? `https:${url}` : url} alt="" className="w-4 h-4 rounded-sm object-contain shrink-0" onError={() => setError(true)} />;
}

function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      if (i <= text.length) { setDisplayed(text.slice(0, i)); i++; }
      else clearInterval(id);
    }, 8);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span>
      {displayed}
      {displayed.length < text.length && <span className="inline-block w-1 h-4 ml-0.5 bg-violet-400 animate-pulse align-middle" />}
    </span>
  );
}

export default function ResultsPage() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [, setLocation] = useLocation();
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json() as SearchResponse;
      setData(json);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery);
  }, [initialQuery]);

  const handleSearch = () => {
    const q = inputVal.trim();
    if (!q) return;
    setQuery(q);
    setLocation(`/search?q=${encodeURIComponent(q)}`);
    doSearch(q);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xl font-semibold text-gradient shrink-0 hidden sm:block"
            style={{ fontFamily: "'Dancing Script', cursive" }}>
            Search Scraper
          </span>
          <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 search-glow transition-all">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              placeholder="Search anything..."
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity active:scale-95 shrink-0"
          >
            Search
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4 min-w-0">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-foreground font-medium">Del Scraper is searching...</p>
                <p className="text-muted-foreground text-sm mt-1">Scraping the web and thinking</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          {data && !loading && (
            <>
              <p className="text-xs text-muted-foreground">About {data.results.length} results for "<span className="text-foreground">{data.query}</span>"</p>

              {(data.aiAnswer || data.directAnswer) && (
                <div className="ai-card animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-gradient-brand flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gradient uppercase tracking-wider">Del Scraper</span>
                  </div>
                  {data.directAnswer && (
                    <p className="text-sm font-medium text-foreground mb-2">{data.directAnswer}</p>
                  )}
                  {data.aiAnswer && (
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      <TypingText text={data.aiAnswer} />
                    </p>
                  )}
                  {data.abstractUrl && (
                    <a href={data.abstractUrl} target="_blank" rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      {data.abstractSource || getDomain(data.abstractUrl)}
                    </a>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {data.results.map((result, i) => (
                  <a
                    key={i}
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="result-card block animate-in fade-in slide-in-from-bottom-1 duration-300 no-underline"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FaviconImg url={result.favicon} domain={getDomain(result.url)} />
                      <span className="text-[11px] text-muted-foreground truncate">{getDomain(result.url)}</span>
                      {result.source === "ai" && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 ml-auto shrink-0">AI</span>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors leading-snug mb-1 line-clamp-2">{result.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{result.snippet}</p>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">About Del Scraper</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Del Scraper is the AI powering Search Scraper — it reads your query, searches the web, and gives you a direct AI-generated answer alongside real results.
            </p>
          </div>

          {!loading && !data && (
            <div className="rounded-xl bg-card border border-border p-4 space-y-2">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Try asking</span>
              {["What is machine learning?", "How to start a business?", "Best Python libraries 2025"].map(s => (
                <button
                  key={s}
                  onClick={() => { setInputVal(s); setQuery(s); setLocation(`/search?q=${encodeURIComponent(s)}`); doSearch(s); }}
                  className="w-full text-left text-xs text-muted-foreground hover:text-foreground py-1.5 border-b border-border last:border-0 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
