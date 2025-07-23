import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import ExceptionDashboard from "./ExceptionDashboard";
import WorkflowTab from "./WorkflowTab";
import WorkflowStepTab from "./WorkflowStepTab";
import AdhocReports from "./AdhocReports";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";
import Sidebar from "./Sidebar";
import { Notifications } from "./Notifications";

const Home = () => {
  const [activeView, setActiveView] = useState("dashboard");

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <ExceptionDashboard />;
      case "exceptions":
        return <WorkflowTab />;
      case "workflow":
        return <WorkflowStepTab />;
      case "reports":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Standard reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Standard reporting functionality will be displayed here.
              </p>
            </CardContent>
          </Card>
        );
      case "adhoc-reports":
        return <AdhocReports />;
      case "admin":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>
                System configuration and user management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Admin controls will be displayed here.
              </p>
            </CardContent>
          </Card>
        );
      default:
        return <ExceptionDashboard />;
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="exception-management-theme">
      <div className="flex min-h-screen bg-background">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-background">
            <div className="container flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">Exception Hub</h1>
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
            {renderContent()}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Home;