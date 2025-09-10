import React from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import { LoadingProvider, useLoading } from "@/contexts/LoadingContext";
import { ThemeToggle } from "./ThemeToggle";
import Sidebar from "./Sidebar";
import { Notifications } from "./Notifications";
import { UserProfile } from "./UserProfile";
import { LoadingOverlay } from "@/components/ui/loading-spinner";

interface LayoutProps {
  children: React.ReactNode;
}

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/exceptions": "Exceptions",
  "/workflow": "Workflow",
  "/reports": "Reports",
  "/adhoc-reports": "Adhoc Reports",
  "/admin": "Admin Panel",
};

const LayoutContent = ({ children }: LayoutProps) => {
  const router = useRouter();
  const { isLoading, loadingMessage } = useLoading();
  const currentPageName = pageNames[router.pathname] || "Exception Hub";

  return (
    <>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Exception Hub
                </h1>
                <span className="text-muted-foreground">•</span>
                <h2 className="text-lg font-medium text-muted-foreground">{currentPageName}</h2>
              </div>

              <div className="flex items-center gap-3">
                <Notifications />

                <ThemeToggle />

                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>

                <UserProfile />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
      
      {/* Global Loading Overlay */}
      {isLoading && <LoadingOverlay message={loadingMessage} />}
    </>
  );
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="exception-management-theme">
      <LoadingProvider>
        <UserProvider>
          <LayoutContent>{children}</LayoutContent>
        </UserProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
};

export default Layout;