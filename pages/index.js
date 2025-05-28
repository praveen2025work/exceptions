import React from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Filter, Search, Settings, User } from "lucide-react";
import ExceptionDashboard from "@/components/ExceptionDashboard";

export default function Home() {
  return (
    <>
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

              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>

              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123"
                    alt="User"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">John Doe</p>
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
          <div className="mb-6">
            <Tabs defaultValue="dashboard">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
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

              <TabsContent value="dashboard" className="mt-6">
                <ExceptionDashboard />
              </TabsContent>

              <TabsContent value="exceptions" className="mt-6">
                <ExceptionDashboard />
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>
                      Generate and view compliance reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Exception Aging Report</CardTitle>
                          <CardDescription>View exceptions by aging buckets</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full">Generate Report</Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">SLA Compliance Report</CardTitle>
                          <CardDescription>Track SLA performance metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full">Generate Report</Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Workflow Status Report</CardTitle>
                          <CardDescription>Monitor workflow processing status</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full">Generate Report</Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admin" className="mt-6">
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

        {/* Footer */}
        <footer className="border-t bg-background">
          <div className="container flex h-14 items-center justify-between px-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Exception Management System
            </p>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}