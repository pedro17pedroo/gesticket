import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { LanguageProvider } from "@/contexts/language-context";
import { ChatbotProvider } from "@/components/layout/chatbot-provider";
import FloatingChatButton from "@/components/layout/floating-chat-button";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Tickets from "@/pages/tickets";
import Customers from "@/pages/customers";
import SLA from "@/pages/sla";
import TimeTracking from "@/pages/time-tracking";
import Reports from "@/pages/reports";
import AdvancedReports from "@/pages/advanced-reports";
import KnowledgeBase from "@/pages/knowledge-base";
import Gamification from "@/pages/gamification";
import NotFound from "@/pages/not-found";
import ClientPortal from "@/pages/client-portal";
import Settings from "@/pages/settings";
import SLAConfig from "@/pages/sla-config";
import CompanyManagement from "@/pages/company-management";
import EnhancedClientPortal from "@/pages/enhanced-client-portal";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/tickets" component={Tickets} />
          <Route path="/customers" component={Customers} />
          <Route path="/sla" component={SLA} />
          <Route path="/time-tracking" component={TimeTracking} />
          <Route path="/reports" component={Reports} />
          <Route path="/advanced-reports" component={AdvancedReports} />
          <Route path="/knowledge-base" component={KnowledgeBase} />
          <Route path="/gamification" component={Gamification} />
          <Route path="/client-portal" component={ClientPortal} />
          <Route path="/settings" component={Settings} />
          <Route path="/sla-config" component={SLAConfig} />
          <Route path="/company-management" component={CompanyManagement} />
          <Route path="/enhanced-client-portal" component={EnhancedClientPortal} />
        </>
      )}
      <Route component={NotFound} />
      {isAuthenticated && <FloatingChatButton />}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <LanguageProvider>
          <ChatbotProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ChatbotProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
