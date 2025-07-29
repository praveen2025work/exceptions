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
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-background">
            <div className="container flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">Exception Hub</h1>
                <span className="text-muted-foreground">•</span>
                <h2 className="text-lg font-medium">{currentPageName}</h2>
              </div>

              <div className="flex items-center gap-4">
                <Notifications />

                <ThemeToggle />

                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={process.env.NEXT_PUBLIC_AVATAR_URL || "https://api.dicebear.com/7.x/avataaars/svg?seed=praveen"}
                      alt="User"
                    />
                    <AvatarFallback>PK</AvatarFallback>
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
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Layout;