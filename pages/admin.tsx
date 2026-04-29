import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../src/components/ui/tabs";
import { AdminSettings } from "../src/components/AdminSettings";
import { UploadTracking } from "../src/components/UploadTracking";
import { BusinessAreaL4Entitlements } from "../src/components/BusinessAreaL4Entitlements";

export default function AdminPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6">
        <Tabs defaultValue="settings" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="upload-tracking">Upload Tracking</TabsTrigger>
            <TabsTrigger value="business-area-l4">Business Area L4 Access</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="flex-1 mt-6">
            <AdminSettings />
          </TabsContent>

          <TabsContent value="upload-tracking" className="flex-1 mt-6">
            <UploadTracking />
          </TabsContent>

          <TabsContent value="business-area-l4" className="flex-1 mt-6">
            <BusinessAreaL4Entitlements />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
