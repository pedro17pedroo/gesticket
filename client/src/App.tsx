import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { LanguageProvider } from "@/contexts/language-context";
import { ChatbotProvider } from "@/components/layout/chatbot-provider";
import FloatingChatButton from "@/components/layout/floating-chat-button";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Tickets from "@/pages/tickets";
import TicketFormPage from "@/pages/ticket-form-page";
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
import AccessControl from "@/pages/access-control";
import MultiTenantDashboard from "@/pages/multi-tenant-dashboard";
import SystemDashboard from "@/pages/system-dashboard";
import ClientOrganizationDetail from "@/pages/client-organization-detail";
import ClientTicketsManagement from "@/pages/client-tickets-management";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/tickets">
            <ProtectedRoute requiredPermissions={[{resource: 'tickets', action: 'list'}]}>
              <Tickets />
            </ProtectedRoute>
          </Route>
          <Route path="/tickets/new">
            <ProtectedRoute requiredPermissions={[{resource: 'tickets', action: 'create'}]}>
              <TicketFormPage />
            </ProtectedRoute>
          </Route>
          <Route path="/customers">
            <ProtectedRoute requiredPermissions={[{resource: 'customers', action: 'list'}]}>
              <Customers />
            </ProtectedRoute>
          </Route>
          <Route path="/sla">
            <ProtectedRoute requiredPermissions={[{resource: 'sla', action: 'view'}]}>
              <SLA />
            </ProtectedRoute>
          </Route>
          <Route path="/time-tracking">
            <ProtectedRoute requiredPermissions={[{resource: 'time', action: 'list'}]}>
              <TimeTracking />
            </ProtectedRoute>
          </Route>
          <Route path="/reports">
            <ProtectedRoute requiredPermissions={[{resource: 'reports', action: 'view'}]}>
              <Reports />
            </ProtectedRoute>
          </Route>
          <Route path="/advanced-reports">
            <ProtectedRoute requiredPermissions={[{resource: 'reports', action: 'advanced'}]}>
              <AdvancedReports />
            </ProtectedRoute>
          </Route>
          <Route path="/knowledge-base">
            <ProtectedRoute requiredPermissions={[{resource: 'knowledge', action: 'list'}]}>
              <KnowledgeBase />
            </ProtectedRoute>
          </Route>
          <Route path="/gamification">
            <ProtectedRoute requiredPermissions={[{resource: 'gamification', action: 'view'}]}>
              <Gamification />
            </ProtectedRoute>
          </Route>
          <Route path="/client-portal">
            <ProtectedRoute requiredPermissions={[{resource: 'client_portal', action: 'view'}]}>
              <ClientPortal />
            </ProtectedRoute>
          </Route>
          <Route path="/settings">
            <ProtectedRoute requiredPermissions={[{resource: 'settings', action: 'view'}]}>
              <Settings />
            </ProtectedRoute>
          </Route>
          <Route path="/sla-config">
            <ProtectedRoute requiredPermissions={[{resource: 'sla', action: 'config'}]}>
              <SLAConfig />
            </ProtectedRoute>
          </Route>
          <Route path="/company-management">
            <ProtectedRoute requiredPermissions={[{resource: 'companies', action: 'manage'}]}>
              <CompanyManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/enhanced-client-portal">
            <ProtectedRoute requiredPermissions={[{resource: 'client_portal', action: 'advanced'}]}>
              <EnhancedClientPortal />
            </ProtectedRoute>
          </Route>
          <Route path="/access-control">
            <ProtectedRoute requiredPermissions={[{resource: 'access_control', action: 'manage'}]}>
              <AccessControl />
            </ProtectedRoute>
          </Route>
          <Route path="/multi-tenant-dashboard">
            <ProtectedRoute requiredPermissions={[{resource: 'organizations', action: 'manage'}]}>
              <MultiTenantDashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/system-dashboard">
            <ProtectedRoute requiredPermissions={[{resource: 'system', action: 'manage'}]}>
              <SystemDashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/client-organizations/:id">
            <ProtectedRoute requiredPermissions={[{resource: 'client_management', action: 'manage'}]}>
              <ClientOrganizationDetail />
            </ProtectedRoute>
          </Route>
          <Route path="/client-tickets-management">
            <ProtectedRoute requiredPermissions={[{resource: 'client_management', action: 'manage'}]}>
              <ClientTicketsManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/client-tickets-management">
            <ProtectedRoute requiredPermissions={[{resource: 'client_management', action: 'manage'}]}>
              <ClientTicketsManagement />
            </ProtectedRoute>
          </Route>
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
