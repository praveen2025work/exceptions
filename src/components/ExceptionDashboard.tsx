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
    bookCode: "",
    system: "",
    legalEntity: "",
    regulator: "",
    status: "",
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
    <div className="bg-background p-6 h-full w-full">
      <div className="flex justify-between items-center mb-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
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

      {/* Filters Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md">Filters</CardTitle>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <p className="text-sm mb-2">Book Code</p>
              <Input
                placeholder="Search book codes..."
                value={filters.bookCode}
                onChange={(e) => handleFilterChange("bookCode", e.target.value)}
              />
            </div>
            <div>
              <p className="text-sm mb-2">System</p>
              <Select
                value={filters.system}
                onValueChange={(value) => handleFilterChange("system", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Systems</SelectItem>
                  <SelectItem value="COMPASS">COMPASS</SelectItem>
                  <SelectItem value="AMM">AMM</SelectItem>
                  <SelectItem value="Atlas">Atlas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm mb-2">Legal Entity</p>
              <Select
                value={filters.legalEntity}
                onValueChange={(value) =>
                  handleFilterChange("legalEntity", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="BCINC">BCINC</SelectItem>
                  <SelectItem value="BBPLC">BBPLC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm mb-2">Regulator</p>
              <Select
                value={filters.regulator}
                onValueChange={(value) =>
                  handleFilterChange("regulator", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select regulator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regulators</SelectItem>
                  <SelectItem value="FRB">FRB</SelectItem>
                  <SelectItem value="PRA">PRA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm mb-2">Status</p>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aging Metrics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-md">Exception Aging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agingMetrics.map((metric, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{metric.label}</span>
                  <span>
                    {metric.count} exceptions ({metric.percentage}%)
                  </span>
                </div>
                <Progress value={metric.percentage} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exception List */}
      <Card>
        <CardHeader className="pb-3">
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
        <CardContent>
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
