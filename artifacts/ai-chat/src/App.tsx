import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SignIn from "@/pages/sign-in";
import SignUp from "@/pages/sign-up";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function AuthQueryCacheInvalidator() {
  const { user } = useAuth0();
  const qc = useQueryClient();
  const prevIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const id = user?.sub;
    if (prevIdRef.current !== undefined && prevIdRef.current !== id) {
      qc.clear();
    }
    prevIdRef.current = id;
  }, [user?.sub, qc]);

  return null;
}

function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthQueryCacheInvalidator />
      <TooltipProvider>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/sign-in/*?" component={SignIn} />
          <Route path="/sign-up/*?" component={SignUp} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = window.location.origin + basePath;

  const [, setLocation] = useLocation();

  if (!domain || !clientId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        Auth0 not configured — set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: redirectUri }}
      onRedirectCallback={(appState) => {
        setLocation(appState?.returnTo ?? "/");
      }}
    >
      <AppRoutes />
    </Auth0Provider>
  );
}

function Root() {
  return (
    <WouterRouter base={basePath}>
      <App />
    </WouterRouter>
  );
}

export default Root;
