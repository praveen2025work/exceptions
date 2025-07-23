import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, RefreshCw, Download, TrendingUp, Clock } from "lucide-react";
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

  useEffect(() => {
    const data = loadAndTransformData();
    setExceptions(data.exceptions);
    
    const calculatedMetrics = calculateMetrics(data.exceptions);
    const calculatedAgingMetrics = calculateAgingMetrics(data.exceptions);
    
    setMetrics(propMetrics || calculatedMetrics);
    setAgingMetrics(propAgingMetrics || calculatedAgingMetrics);
  }, [propMetrics, propAgingMetrics]);

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
    if (selectedException) {
      console.log("Saving exception details:", updatedData);
      setWorkflowStatus((prev) => ({
        ...prev,
        [selectedException]: updatedData.status,
      }));
    }
  };

  const handleBulkAction = (action: string, exceptionIds: string[]) => {
    if (action === "assign") {
      console.log("Assigning exceptions:", exceptionIds);
    } else if (action === "update-status") {
      console.log("Updating status for exceptions:", exceptionIds);
    } else if (action === "trigger-workflow") {
      console.log("Triggering workflow for exceptions:", exceptionIds);
      const newWorkflowStatus = { ...workflowStatus };
      exceptionIds.forEach((id) => {
        newWorkflowStatus[id] = "Challenge";
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

  return (
    <div className="bg-background p-2 w-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
                  <div key={index}>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className={`text-xs ${metric.status === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}% vs last week
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Exception Aging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agingMetrics.map((metric, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{metric.label}</span>
                      <span>{metric.count} ({metric.percentage}%)</span>
                    </div>
                    <Progress value={metric.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-medium">Exception List</CardTitle>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-auto">
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
                  <TabsTrigger value="challenge" className="text-xs px-2">Challenge</TabsTrigger>
                  <TabsTrigger value="unwind" className="text-xs px-2">Unwind</TabsTrigger>
                  <TabsTrigger value="centralise" className="text-xs px-2">Centralise</TabsTrigger>
                  <TabsTrigger value="writedown" className="text-xs px-2">Writedown</TabsTrigger>
                  <TabsTrigger value="insufficient-data" className="text-xs px-2">Insufficient Data</TabsTrigger>
                  <TabsTrigger value="reassignment" className="text-xs px-2">Reassignment</TabsTrigger>
                  <TabsTrigger value="sla-breach" className="flex items-center text-xs px-2">
                    <AlertCircle className="h-3 w-3 mr-1 text-destructive" />
                    SLA Breach
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <ExceptionList
              onExceptionSelect={handleExceptionSelect}
              onBulkAction={handleBulkAction}
              filters={filters}
              workflowStatus={workflowStatus}
            />
          </CardContent>
        </Card>
      </div>

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