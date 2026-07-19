import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { detectDevice, getDevicePath, DEVICE_LABELS } from "@/lib/device";
import type { DeviceType } from "@/lib/device";

const PREVIEW_STEPS = [
  { role: "user", text: "Write me a short poem about the stars" },
  { role: "ai", text: "Silver sparks on velvet night,\nsilent songs of ancient light —\neach star a story, each a sigh,\nof worlds that bloom and worlds that die." },
  { role: "user", text: "Now generate an image of a neon city" },
  { role: "ai", text: "🎨 Generating your image...", isImage: true },
];

function AnimatedPreview() {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [typingIdx, setTypingIdx] = useState(-1);

  useEffect(() => {
    let step = 0;
    const showNext = () => {
      if (step >= PREVIEW_STEPS.length) {
        setTimeout(() => { setVisibleSteps(0); setTypedText(""); setTypingIdx(-1); step = 0; showNext(); }, 2000);
        return;
      }
      const cur = PREVIEW_STEPS[step];
      if (cur.role === "ai" && !cur.isImage) {
        setTypingIdx(step);
        let charIdx = 0;
        setTypedText("");
        const typeChar = () => {
          if (charIdx <= cur.text.length) {
            setTypedText(cur.text.slice(0, charIdx));
            charIdx++;
            setTimeout(typeChar, 22);
          } else {
            setVisibleSteps(s => Math.max(s, step + 1));
            setTypingIdx(-1);
            step++;
            setTimeout(showNext, 800);
          }
        };
        typeChar();
      } else {
        setVisibleSteps(s => Math.max(s, step + 1));
        step++;
        setTimeout(showNext, cur.role === "user" ? 600 : 1200);
      }
    };
    const t = setTimeout(showNext, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 bg-[#111113]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-[#0d0d0f]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <span className="text-xs text-white/30 ml-2 font-mono">deliule.ai</span>
      </div>
      <div className="flex h-72">
        <div className="w-36 border-r border-white/8 p-2 space-y-1.5">
          {["poem ideas", "city image", "code help"].map((t, i) => (
            <div key={i} className={`text-[10px] px-2 py-1.5 rounded-md truncate ${i === 1 ? "bg-white/10 text-white/70" : "text-white/25"}`}>{t}</div>
          ))}
        </div>
        <div className="flex-1 p-3 space-y-3 overflow-hidden">
          {PREVIEW_STEPS.map((step, i) => {
            const isVisible = i < visibleSteps || typingIdx === i;
            if (!isVisible) return null;
            const text = typingIdx === i ? typedText : step.text;
            return (
              <div key={i} className={`flex ${step.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                {step.isImage ? (
                  <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/40 flex items-center gap-2">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/40 to-cyan-500/40 flex items-center justify-center text-lg">🌆</div>
                    <span>Neon cityscape generated</span>
                  </div>
                ) : (
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed whitespace-pre-wrap ${
                    step.role === "user"
                      ? "bg-gradient-to-br from-violet-600 to-blue-600 text-white"
                      : "bg-white/8 border border-white/10 text-white/70"
                  }`}>
                    {text}
                    {typingIdx === i && <span className="inline-block w-1 h-3 ml-0.5 bg-white/60 animate-pulse align-middle" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-white/8 bg-[#0d0d0f] flex items-center gap-2">
        <div className="flex-1 h-7 rounded-lg bg-white/5 border border-white/10" />
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs">→</div>
      </div>
    </div>
  );
}

const DEVICE_ICONS: Record<DeviceType, string> = {
  phone: "📱", tablet: "⬜", desktop: "🖥️", watch: "⌚", tv: "📺", consolex: "🟢", consolep: "🔵",
};

export default function Landing() {
  const [, setLocation] = useLocation();
  const detected = detectDevice();
  const autoRedirect = detected === "phone" || detected === "watch" || detected === "tv" || detected === "consolex" || detected === "consolep";

  useEffect(() => {
    if (autoRedirect) {
      setLocation(getDevicePath(detected));
    }
  }, [autoRedirect, detected, setLocation]);

  if (autoRedirect) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-between py-12 px-6 gap-10">
        <div className="flex flex-col items-center text-center gap-3 pt-6">
          <p className="text-white/40 text-sm tracking-widest uppercase">Welcome to</p>
          <h1 className="deliule-cursive text-7xl md:text-8xl leading-none" style={{ fontFamily: "'Dancing Script', cursive", background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Deliule
          </h1>
          <p className="text-white/35 text-sm mt-1">click get started</p>
        </div>

        <div className="w-full max-w-xl px-2">
          <div className="text-center text-xs text-white/20 mb-3 uppercase tracking-wider">Live Preview</div>
          <AnimatedPreview />
        </div>

        <div className="flex flex-col items-center gap-4 pb-4 w-full max-w-xs">
          <button
            onClick={() => setLocation(getDevicePath(detected))}
            className="w-full py-4 px-8 rounded-2xl text-white font-semibold text-lg tracking-wide transition-all active:scale-95 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)", boxShadow: "0 0 40px rgba(139,92,246,0.3)" }}
          >
            Get Started →
          </button>
          <div className="flex items-center gap-2 text-xs text-white/20">
            <span>Detected:</span>
            <span>{DEVICE_ICONS[detected]}</span>
            <span>{DEVICE_LABELS[detected]}</span>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            {(["phone", "tablet", "desktop", "watch", "tv", "consolex", "consolep"] as DeviceType[]).map(d => (
              <button key={d} onClick={() => setLocation(getDevicePath(d))} className="text-xs text-white/20 hover:text-white/50 transition-colors">
                {DEVICE_ICONS[d]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
