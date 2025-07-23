import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Users, BarChart3, RefreshCw } from "lucide-react";

const AdhocReports: React.FC = () => {
  return (
    <div className="bg-background p-4 h-full w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Adhoc Reports</h1>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="exceptions">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="exceptions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Exceptions Report
              </TabsTrigger>
              <TabsTrigger value="reassignment" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Reassignment Report
              </TabsTrigger>
              <TabsTrigger value="tprt" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                TPRT Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="exceptions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exceptions Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Exception data will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reassignment" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reassignment Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Reassignment report content will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tprt" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>TPRT Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>TPRT report content will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdhocReports;