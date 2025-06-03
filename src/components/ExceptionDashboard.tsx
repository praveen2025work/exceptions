import React, { useState, useEffect } from "react";
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
import { loadAndTransformData } from "@/utils/dataTransform";
import { Exception } from "@/types/exception";

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
  metrics: propMetrics,
  agingMetrics: propAgingMetrics,
}) => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedException, setSelectedException] = useState<string | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [metrics, setMetrics] = useState<ExceptionMetric[]>([]);
  const [agingMetrics, setAgingMetrics] = useState<AgingMetric[]>([]);
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

  // Load and transform data on component mount
  useEffect(() => {
    const data = loadAndTransformData();
    setExceptions(data.exceptions);
    
    // Calculate real metrics from the data
    const calculatedMetrics = calculateMetrics(data.exceptions);
    const calculatedAgingMetrics = calculateAgingMetrics(data.exceptions);
    
    setMetrics(propMetrics || calculatedMetrics);
    setAgingMetrics(propAgingMetrics || calculatedAgingMetrics);
  }, [propMetrics, propAgingMetrics]);

  // Function to calculate metrics from exception data
  const calculateMetrics = (exceptions: Exception[]): ExceptionMetric[] => {
    const totalExceptions = exceptions.length;
    const completedToday = exceptions.filter(exc => 
      (exc.status === 'Unwind' || exc.status === 'Centralise' || exc.status === 'Writedown') && 
      new Date(exc.created_date).toDateString() === new Date().toDateString()
    ).length;
    const slaBreaches = exceptions.filter(exc => exc.sla_status === 'SLA Breach').length;
    const pendingReview = exceptions.filter(exc => exc.status === 'Challenge' || exc.status === 'Insufficient Data').length;

    return [
      { label: "Total Exceptions", value: totalExceptions, change: 12, status: "negative" },
      { label: "Completed Today", value: completedToday, change: 8, status: "positive" },
      { label: "SLA Breaches", value: slaBreaches, change: -5, status: "positive" },
      { label: "Pending Review", value: pendingReview, change: 3, status: "negative" },
    ];
  };

  // Function to calculate aging metrics from exception data
  const calculateAgingMetrics = (exceptions: Exception[]): AgingMetric[] => {
    const totalExceptions = exceptions.length;
    if (totalExceptions === 0) return [];

    const agingBuckets = {
      '0-7 days': exceptions.filter(exc => exc.aging_days <= 7).length,
      '8-14 days': exceptions.filter(exc => exc.aging_days > 7 && exc.aging_days <= 14).length,
      '15-30 days': exceptions.filter(exc => exc.aging_days > 14 && exc.aging_days <= 30).length,
      '30+ days': exceptions.filter(exc => exc.aging_days > 30).length,
    };

    return Object.entries(agingBuckets).map(([label, count]) => ({
      label,
      count,
      percentage: Math.round((count / totalExceptions) * 100),
    }));
  };

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
        newWorkflowStatus[id] = "Challenge";

        // In a real app, this would call an API to create a workflow
        // For example: createExceptionWorkflow(id);

        // Update the exception in the list to show it's being processed
        setExceptions((prev) =>
          prev.map((exception) =>
            exception.id === id
              ? { ...exception, status: "Challenge" }
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

      {/* Combined Metrics and Aging in Single Row */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex gap-4">
            {/* Left Section: Metrics in Vertical Layout */}
            <div className="flex-1">
              <h3 className="text-md font-semibold mb-3">Key Metrics</h3>
              <div className="grid grid-cols-1 gap-3">
                {metrics.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {metric.label}
                      </p>
                      <h4 className="text-xl font-bold mt-1">{metric.value}</h4>
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
                ))}
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="w-px bg-border"></div>

            {/* Right Section: Exception Aging */}
            <div className="flex-1">
              <h3 className="text-md font-semibold mb-3">Exception Aging</h3>
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
            </div>
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
                <TabsTrigger value="challenge">Challenge</TabsTrigger>
                <TabsTrigger value="unwind">Unwind</TabsTrigger>
                <TabsTrigger value="centralise">Centralise</TabsTrigger>
                <TabsTrigger value="writedown">Writedown</TabsTrigger>
                <TabsTrigger value="insufficient-data">Insufficient Data</TabsTrigger>
                <TabsTrigger value="reassignment">Reassignment</TabsTrigger>
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
