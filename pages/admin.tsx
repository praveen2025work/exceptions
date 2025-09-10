import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../src/components/ui/tabs";
import { AdminSettings } from "../src/components/AdminSettings";
import { UploadTracking } from "../src/components/UploadTracking";

export default function AdminPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            System configuration and administrative tools
          </p>
        </div>
        
        <Tabs defaultValue="settings" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="upload-tracking">Upload Tracking</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="flex-1 mt-6">
            <AdminSettings />
          </TabsContent>
          
          <TabsContent value="upload-tracking" className="flex-1 mt-6">
            <UploadTracking />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}