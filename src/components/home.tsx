import React, { useState, lazy, Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Filter, Search, Settings } from "lucide-react";
import ExceptionDashboard from "./ExceptionDashboard";
import WorkflowTab from "./WorkflowTab";
import WorkflowStepTab from "./WorkflowStepTab";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";

const AdhocReports = lazy(() => import("./AdhocReports"));

const Home = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <ThemeProvider defaultTheme="system" storageKey="exception-management-theme">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Exception Management System</h1>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>

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
        <main className="container px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <div className="mb-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="exceptions">Workflow</TabsTrigger>
                <TabsTrigger value="workflow">Exceptions</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="adhoc-reports">Adhoc Reports</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search exceptions..."
                  className="w-[200px] md:w-[300px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>

              <Button>
                <span>New Exception</span>
              </Button>
            </div>

            {/* Tab Contents */}
            <TabsContent value="dashboard">
              <ExceptionDashboard />
            </TabsContent>

            <TabsContent value="exceptions">
              <WorkflowTab />
            </TabsContent>

            <TabsContent value="workflow">
              <WorkflowStepTab />
            </TabsContent>

            <TabsContent value="reports">
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
            </TabsContent>

            <TabsContent value="adhoc-reports">
              <Suspense fallback={<Card><CardContent>Loading report...</CardContent></Card>}>
                <AdhocReports />
              </Suspense>
            </TabsContent>

            <TabsContent value="admin">
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
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="border-t bg-background">
          <div className="container flex h-14 items-center justify-between px-4">
            <p className="text-sm text-muted-foreground">
              © 2023 Exception Management System
            </p>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Home;