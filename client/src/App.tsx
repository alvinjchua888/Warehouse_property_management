import { Switch, Route } from "wouter";
import { createContext, useContext } from "react";
import { queryClient, getQueryFn } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencyProvider } from "@/components/currency-provider";
import { CurrencySelector } from "@/components/currency-selector";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Warehouses from "@/pages/warehouses";
import Tenants from "@/pages/tenants";
import Leases from "@/pages/leases";
import Payments from "@/pages/payments";
import Maintenance from "@/pages/maintenance";
import AdminUsers from "@/pages/admin-users";
import AuthPage from "@/pages/auth";
import { Loader2 } from "lucide-react";

type User = { id: number; username: string; isAdmin: boolean } | null;

const UserContext = createContext<User>(null);
export function useCurrentUser() {
  return useContext(UserContext);
}

function useUser() {
  return useQuery<User>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: Infinity,
    retry: false,
  });
}

function Router({ user }: { user: User }) {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/warehouses" component={Warehouses} />
      <Route path="/tenants" component={Tenants} />
      <Route path="/leases" component={Leases} />
      <Route path="/payments" component={Payments} />
      <Route path="/maintenance" component={Maintenance} />
      {user?.isAdmin && <Route path="/admin/users" component={AdminUsers} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp({ user }: { user: User }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <UserContext.Provider value={user}>
      <CurrencyProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="flex items-center justify-between gap-2 p-2 border-b sticky top-0 z-50 bg-background">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="flex items-center gap-2">
                  <CurrencySelector />
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto p-4 md:p-6">
                <Router user={user} />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </CurrencyProvider>
    </UserContext.Provider>
  );
}

function AppContent() {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <AuthenticatedApp user={user} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
