import { useState } from "react";
import { useSignIn } from "@clerk/react";
import { useLocation } from "wouter";
import { Loader2, Eye, EyeOff } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const SOCIAL_PROVIDERS = [
  {
    strategy: "oauth_google" as const,
    label: "Continue with Google",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    strategy: "oauth_apple" as const,
    label: "Continue with Apple",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
  {
    strategy: "oauth_github" as const,
    label: "Continue with GitHub",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
  },
];

export default function SignIn() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setLocation("/");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr.errors?.[0]?.message ?? "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (strategy: "oauth_google" | "oauth_apple" | "oauth_github") => {
    if (!isLoaded) return;
    setSocialLoading(strategy);
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: `${window.location.origin}${basePath}/sign-in/sso-callback`,
        redirectUrlComplete: `${window.location.origin}${basePath}/`,
      });
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr.errors?.[0]?.message ?? "Social sign in failed.");
      setSocialLoading(null);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-white/8 bg-[#1c1c1f] shadow-2xl shadow-black/50 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-premium flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
              <span className="text-white font-bold text-xl tracking-tight">Dl</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-zinc-400 text-sm mt-1">Sign in to your Deliule account</p>
          </div>

          <div className="space-y-2 mb-6">
            {SOCIAL_PROVIDERS.map((p) => (
              <button
                key={p.strategy}
                onClick={() => handleSocial(p.strategy)}
                disabled={!isLoaded || !!socialLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/50 text-zinc-200 text-sm font-medium hover:bg-zinc-700/50 transition-colors disabled:opacity-50"
              >
                {socialLoading === p.strategy ? <Loader2 className="w-4 h-4 animate-spin" /> : p.icon}
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-zinc-700" />
            <span className="text-xs text-zinc-500">or continue with email</span>
            <div className="flex-1 h-px bg-zinc-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !isLoaded}
              className="w-full py-2.5 rounded-xl bg-gradient-premium text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>
        </div>

        <div className="px-8 py-4 bg-zinc-900/60 border-t border-zinc-800 text-center">
          <span className="text-zinc-500 text-sm">Don't have an account? </span>
          <button
            onClick={() => setLocation("/sign-up")}
            className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
