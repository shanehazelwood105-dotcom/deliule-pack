import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import PhoneLayout from "@/pages/device/phone";
import TabletLayout from "@/pages/device/tablet";
import WatchLayout from "@/pages/device/watch";
import TvLayout from "@/pages/device/tv";
import ConsoleLayout from "@/pages/device/console";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/desktop" component={Home} />
            <Route path="/tablet" component={TabletLayout} />
            <Route path="/phone" component={PhoneLayout} />
            <Route path="/watch" component={WatchLayout} />
            <Route path="/tv" component={TvLayout} />
            <Route path="/console" component={ConsoleLayout} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
