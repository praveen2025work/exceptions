import React from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";
import Sidebar from "./Sidebar";
import { Notifications } from "./Notifications";

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

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const currentPageName = pageNames[router.pathname] || "Exception Hub";

  return (
    <ThemeProvider defaultTheme="system" storageKey="exception-management-theme">
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

                <div className="flex items-center gap-3 pl-3 border-l">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={process.env.NEXT_PUBLIC_AVATAR_URL || "https://api.dicebear.com/7.x/avataaars/svg?seed=praveen"}
                      alt="User"
                    />
                    <AvatarFallback className="text-xs">PK</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">Praveen Kumar</p>
                    <p className="text-xs text-muted-foreground">
                      Compliance Officer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Layout;