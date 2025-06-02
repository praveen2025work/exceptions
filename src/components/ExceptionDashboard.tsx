import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Filter, RefreshCw, Download } from "lucide-react";
import ExceptionList from "./ExceptionList";
import ExceptionDetails from "./ExceptionDetails";

interface ExceptionMetric {
  label: string;
  value: number;
  change: number;
  status: "positive" | "negative" | "neutral";
}

interface AgingMetric {
  label: string;
  count: number;
  percentage: number;
}

interface ExceptionDashboardProps {
  metrics?: ExceptionMetric[];
  agingMetrics?: AgingMetric[];
}

const ExceptionDashboard: React.FC<ExceptionDashboardProps> = ({
  metrics = [
    { label: "Total Exceptions", value: 247, change: 12, status: "negative" },
    { label: "Resolved Today", value: 32, change: 8, status: "positive" },
    { label: "SLA Breaches", value: 18, change: -5, status: "positive" },
    { label: "Pending Review", value: 54, change: 3, status: "negative" },
  ],
  agingMetrics = [
    { label: "0-7 days", count: 124, percentage: 50 },
    { label: "8-14 days", count: 68, percentage: 28 },
    { label: "15-30 days", count: 42, percentage: 17 },
    { label: "30+ days", count: 13, percentage: 5 },
  ],
}) => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedException, setSelectedException] = useState<string | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    ads_book_code: "",
    system: "",
    legal_entity: "",
    regulator: "",
    status: "",
    l04_business_area_name: "",
    l06_name: "",
  });
  const [workflowStatus, setWorkflowStatus] = useState<Record<string, string>>(
    {},
  );

  const handleExceptionSelect = (exception: any) => {
    setSelectedException(exception.id);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedException(null);
  };

  const handleSaveExceptionDetails = (updatedData: any) => {
    // Update the exception in the list
    if (selectedException) {
      // In a real app, this would call an API
      console.log("Saving exception details:", updatedData);

      // For demo purposes, we'll update the status in our workflow tracking
      setWorkflowStatus((prev) => ({
        ...prev,
        [selectedException]: updatedData.status,
      }));
    }
  };

  const handleBulkAction = (action: string, exceptionIds: string[]) => {
    if (action === "assign") {
      // Show assignment dialog or implement assignment logic
      console.log("Assigning exceptions:", exceptionIds);
      // In a real app, this would open a dialog or call an API
    } else if (action === "update-status") {
      // Show status update dialog or implement status update logic
      console.log("Updating status for exceptions:", exceptionIds);
      // In a real app, this would open a dialog or call an API
    } else if (action === "trigger-workflow") {
      // Trigger workflow for selected exceptions
      console.log("Triggering workflow for exceptions:", exceptionIds);

      // For demo purposes, we'll update the workflow status
      const newWorkflowStatus = { ...workflowStatus };
      exceptionIds.forEach((id) => {
        newWorkflowStatus[id] = "In Progress";

        // In a real app, this would call an API to create a workflow
        // For example: createExceptionWorkflow(id);

        // Update the exception in the list to show it's being processed
        setExceptions((prev) =>
          prev.map((exception) =>
            exception.id === id
              ? { ...exception, status: "In Progress" }
              : exception,
          ),
        );
      });
      setWorkflowStatus(newWorkflowStatus);
    }
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  return (
    <div className="bg-background p-3 h-full w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Exception Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {metric.label}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">{metric.value}</h3>
                </div>
                <Badge
                  variant={
                    metric.status === "positive"
                      ? "secondary"
                      : metric.status === "negative"
                        ? "destructive"
                        : "outline"
                  }
                  className="flex items-center"
                >
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aging Metrics */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Exception Aging</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-3">
            {agingMetrics.map((metric, index) => {
              // Define aging colors based on the metric label
              const getAgingColor = (label: string) => {
                if (label.includes("0-7")) {
                  return {
                    bg: "bg-green-50 dark:bg-green-900/20 ocean:bg-green-100/50 modern:bg-green-900/30",
                    indicator: "bg-green-500",
                    text: "text-green-700 dark:text-green-300 ocean:text-green-800 modern:text-green-400"
                  };
                } else if (label.includes("8-14")) {
                  return {
                    bg: "bg-yellow-50 dark:bg-yellow-900/20 ocean:bg-yellow-100/50 modern:bg-yellow-900/30",
                    indicator: "bg-yellow-500",
                    text: "text-yellow-700 dark:text-yellow-300 ocean:text-yellow-800 modern:text-yellow-400"
                  };
                } else if (label.includes("15-30")) {
                  return {
                    bg: "bg-orange-50 dark:bg-orange-900/20 ocean:bg-orange-100/50 modern:bg-orange-900/30",
                    indicator: "bg-orange-500",
                    text: "text-orange-700 dark:text-orange-300 ocean:text-orange-800 modern:text-orange-400"
                  };
                } else {
                  return {
                    bg: "bg-red-50 dark:bg-red-900/20 ocean:bg-red-100/50 modern:bg-red-900/30",
                    indicator: "bg-red-500",
                    text: "text-red-700 dark:text-red-300 ocean:text-red-800 modern:text-red-400"
                  };
                }
              };

              const colors = getAgingColor(metric.label);

              return (
                <div key={index} className={`space-y-2 p-3 rounded-lg border ${colors.bg}`}>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors.indicator}`}></div>
                      <span className={`font-medium ${colors.text}`}>{metric.label}</span>
                    </div>
                    <span className={colors.text}>
                      {metric.count} exceptions ({metric.percentage}%)
                    </span>
                  </div>
                  <Progress 
                    value={metric.percentage} 
                    className="h-2"
                    style={{
                      '--progress-background': colors.indicator.replace('bg-', ''),
                    } as React.CSSProperties}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Exception List */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md">Exception List</CardTitle>
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
                <TabsTrigger value="sla-breach" className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-destructive" />
                  SLA Breach
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <ExceptionList
            onExceptionSelect={handleExceptionSelect}
            onBulkAction={handleBulkAction}
            filters={filters}
            workflowStatus={workflowStatus}
          />
        </CardContent>
      </Card>

      {/* Exception Details Side Panel */}
      {showDetails && (
        <div className="fixed inset-y-0 right-0 w-[30%] bg-background border-l shadow-lg overflow-y-auto z-50">
          <ExceptionDetails
            exceptionId={selectedException || ""}
            onClose={handleCloseDetails}
            onSave={handleSaveExceptionDetails}
          />
        </div>
      )}
    </div>
  );
};

export default ExceptionDashboard;
