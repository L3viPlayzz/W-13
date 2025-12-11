import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FileSystemProvider } from "@/lib/FileSystemContext";
import { SystemSettingsProvider } from "@/lib/SystemSettingsContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SystemSettingsProvider>
          <FileSystemProvider>
            <Toaster />
            <Router />
          </FileSystemProvider>
        </SystemSettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
