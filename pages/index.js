import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Filter, Search, Settings, User } from "lucide-react";
import ExceptionDashboard from "@/components/ExceptionDashboard";
import WorkflowTab from "@/components/WorkflowTab";
import WorkflowStepTab from "@/components/WorkflowStepTab";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function Home() {
  const [userImage, setUserImage] = useState("");

  // Fetch user image from API
  useEffect(() => {
    const fetchUserImage = async () => {
      try {
        // Replace this URL with your actual API endpoint
        // Example: const response = await fetch('/api/user/profile');
        // const userData = await response.json();
        // setUserImage(userData.profileImage);
        
        // For now, using a placeholder API - you can change this URL
        const apiUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=praveen";
        setUserImage(apiUrl);
      } catch (error) {
        console.error("Failed to fetch user image:", error);
        // Fallback to default image
        setUserImage("https://api.dicebear.com/7.x/avataaars/svg?seed=praveen");
      }
    };

    fetchUserImage();
  }, []);
  return (
    <ThemeProvider defaultTheme="system" storageKey="exception-management-theme">
      <Head>
        <title>Exception Management System - Regulatory Compliance Platform</title>
        <meta name="description" content="Comprehensive exception management system for regulatory compliance, automated processing, and workflow integration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
                    src={userImage}
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
        <main className="container px-3 py-3">
          <div className="mb-3">
            <Tabs defaultValue="dashboard">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
                  <TabsTrigger value="workflow">Workflow</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search exceptions..."
                      className="w-[200px] md:w-[300px] pl-8"
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
              </div>

              <TabsContent value="dashboard" className="mt-3">
                <ExceptionDashboard />
              </TabsContent>

              <TabsContent value="exceptions" className="mt-3">
                <WorkflowTab />
              </TabsContent>

              <TabsContent value="workflow" className="mt-3">
                <WorkflowStepTab />
              </TabsContent>

              <TabsContent value="reports" className="mt-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>
                      Generate and view regulatory compliance reports (no exceptions data)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Regulatory Filing Report</CardTitle>
                          <CardDescription>Generate regulatory compliance filings</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full">Generate Report</Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Risk Assessment Report</CardTitle>
                          <CardDescription>Comprehensive risk analysis and metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full">Generate Report</Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Audit Trail Report</CardTitle>
                          <CardDescription>System audit logs and compliance tracking</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full">Generate Report</Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Performance Metrics</CardTitle>
                          <CardDescription>System performance and operational metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full">Generate Report</Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Data Quality Report</CardTitle>
                          <CardDescription>Data integrity and quality assessments</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full">Generate Report</Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Compliance Summary</CardTitle>
                          <CardDescription>Executive summary of compliance status</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full">Generate Report</Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admin" className="mt-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Panel</CardTitle>
                    <CardDescription>
                      System configuration and user management
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">User Management</h3>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            Manage Users
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            Role Assignments
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            Access Permissions
                          </Button>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-4">System Configuration</h3>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            SLA Settings
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            Workflow Configuration
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            Data Source Settings
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>


      </div>
    </ThemeProvider>
  );
}