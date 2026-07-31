import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Sparkles, Globe, Code2, Music, Zap } from "lucide-react";

const SUGGESTIONS = [
  "how does quantum computing work",
  "best programming languages 2025",
  "latest AI breakthroughs",
  "how to make sourdough bread",
  "climate change solutions",
];

const FEATURES = [
  { icon: Sparkles, label: "AI Answers", desc: "Instant Del Scraper summaries" },
  { icon: Globe, label: "Web Results", desc: "Real search results scraped live" },
  { icon: Code2, label: "Code Help", desc: "Ask about code and get examples" },
  { icon: Music, label: "Any Topic", desc: "Arts, science, news and more" },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    setLocation(`/search?q=${encodeURIComponent(q).replace(/%20/g, "+")}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(139,92,246,0.07)_0%,transparent_60%)] pointer-events-none" />
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 opacity-0 pointer-events-none">
          <span className="text-xl font-semibold text-gradient" style={{ fontFamily: "'Dancing Script', cursive" }}>Search Scraper</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <button className="hover:text-foreground transition-colors">About</button>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
            <Zap className="w-3 h-3 text-violet-400" />
            <span className="text-xs">Del Scraper AI</span>
          </div>
          <a
            href="https://ai-chat-theme--shanehazelwood1.replit.app"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit Deliule"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-violet-500/40 hover:bg-white/10 transition-all"
          >
            <img
              src={`${import.meta.env.BASE_URL}favicon.svg`}
              alt="Deliule"
              className="w-5 h-5 object-contain"
            />
          </a>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        <div className="w-full max-w-2xl flex flex-col items-center gap-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-semibold text-gradient mb-2 leading-tight"
              style={{ fontFamily: "'Dancing Script', cursive" }}>
              Search Scraper
            </h1>
            <p className="text-muted-foreground text-sm">
              Powered by <span className="text-violet-400">Chromium</span> · AI-enhanced search
            </p>
          </div>

          <div className="w-full">
            <div className="relative w-full search-glow rounded-2xl bg-card border border-border transition-all">
              <div className="flex items-center px-4 py-1">
                <Search className="w-5 h-5 text-muted-foreground shrink-0 mr-3" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent py-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {query && (
                  <button
                    onClick={handleSearch}
                    className="ml-2 px-5 py-2 rounded-xl bg-gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity active:scale-95"
                  >
                    Search
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); setTimeout(handleSearch, 10); }}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-muted-foreground hover:text-foreground hover:border-violet-500/30 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-4">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/3 border border-white/6 text-center">
                <Icon className="w-5 h-5 text-violet-400" />
                <div>
                  <div className="text-xs font-medium text-foreground">{label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-muted-foreground/40">
        Search Scraper · Powered by Deliule AI
      </footer>
    </div>
  );
}
