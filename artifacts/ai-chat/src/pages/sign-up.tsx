import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Loader2 } from "lucide-react";

export default function SignUp() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect({
        authorizationParams: { screen_hint: "signup" },
        appState: { returnTo: "/" },
      });
    }
  }, [isAuthenticated, loginWithRedirect]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
    </div>
  );
}
