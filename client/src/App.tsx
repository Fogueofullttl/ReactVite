import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Tournaments from "@/pages/tournaments";
import TournamentDetail from "@/pages/tournament-detail";
import Rankings from "@/pages/rankings";
import PlayerDashboard from "@/pages/player-dashboard";
import Profile from "@/pages/profile";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ArbitroDashboard from "@/pages/arbitro/dashboard";
import MatchScoring from "@/pages/arbitro/match-scoring";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/tournaments/:id" component={TournamentDetail} />
      <Route path="/rankings" component={Rankings} />
      <Route path="/dashboard" component={PlayerDashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/arbitro" component={ArbitroDashboard} />
      <Route path="/arbitro/match/:matchId" component={MatchScoring} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 min-w-0">
                <header className="flex items-center justify-between gap-2 p-2 border-b flex-shrink-0">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
