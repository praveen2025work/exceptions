import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, RefreshCw, Download, TrendingUp, Clock, Eye, EyeOff } from "lucide-react";
import ExceptionList from "./ExceptionList";
import ExceptionDetails from "./ExceptionDetails";
import { fetchAndTransformExceptions } from "@/utils/apiDataTransform";
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
  const [selectedException, setSelectedException] = useState<string | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [showMetricsAndAging, setShowMetricsAndAging] = useState(true);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<ExceptionMetric[]>([]);
  const [agingMetrics, setAgingMetrics] = useState<AgingMetric[]>([]);
  const [filters, setFilters] = useState({
    ads_book_code: "",
    instrument_id: "",
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
    const loadData = async () => {
      setIsLoading(true);
      const fetchedExceptions = await fetchAndTransformExceptions();
      setExceptions(fetchedExceptions);
      
      const calculatedMetrics = calculateMetrics(fetchedExceptions);
      const calculatedAgingMetrics = calculateAgingMetrics(fetchedExceptions);
      
      setMetrics(propMetrics || calculatedMetrics);
      setAgingMetrics(propAgingMetrics || calculatedAgingMetrics);
      setIsLoading(false);
    };

    loadData();
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
    setShowMetricsAndAging(false);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedException(null);
    // Don't automatically show metrics and aging - preserve current state
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

  const handleToggleMetricsAndAging = () => {
    setShowMetricsAndAging(!showMetricsAndAging);
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
    <div className="h-full flex bg-background">
      <div className={`transition-all duration-300 ${showDetails ? 'w-2/3' : 'w-full'} flex flex-col min-w-0`}>
        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {showMetricsAndAging && (
            <div className="p-6 pb-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center">
                      <div className="p-2 rounded-lg bg-primary/10 mr-3">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {metrics.map((metric, index) => (
                        <div key={index} className="space-y-1">
                          <p className="text-xs text-muted-foreground font-medium">{metric.label}</p>
                          <p className="text-2xl font-bold">{metric.value.toLocaleString()}</p>
                          <div className="flex items-center gap-1">
                            <div className={`h-1.5 w-1.5 rounded-full ${metric.status === 'positive' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <p className={`text-xs font-medium ${metric.status === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {metric.change > 0 ? '+' : ''}{metric.change}% vs last week
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center">
                      <div className="p-2 rounded-lg bg-primary/10 mr-3">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      Exception Aging
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {agingMetrics.map((metric, index) => {
                        const getProgressColor = (label: string) => {
                          if (label.includes("0-7")) return "bg-green-500";
                          if (label.includes("8-14")) return "bg-yellow-500";
                          if (label.includes("15-30")) return "bg-orange-500";
                          return "bg-red-500";
                        };

                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{metric.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">{metric.count}</span>
                                <span className="text-xs text-muted-foreground">({metric.percentage}%)</span>
                              </div>
                            </div>
                            <Progress value={metric.percentage} className="h-2" indicatorClassName={getProgressColor(metric.label)} />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Exception List - Full Height */}
          <div className="flex-1 overflow-hidden px-6 pb-6">
            <Card className="h-full border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-3 pt-4 px-4 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-semibold">Exception List</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div className="h-full">
                  <ExceptionList
                    exceptions={exceptions}
                    isLoading={isLoading}
                    onExceptionSelect={handleExceptionSelect}
                    onBulkAction={handleBulkAction}
                    filters={filters}
                    workflowStatus={workflowStatus}
                    showMetricsAndAging={showMetricsAndAging}
                    onToggleMetricsAndAging={handleToggleMetricsAndAging}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Details Panel */}
      <div className={`transition-all duration-300 ${showDetails ? 'w-1/3' : 'w-0'} overflow-hidden border-l bg-background/50`}>
        {showDetails && (
          <div className="h-full">
            <ExceptionDetails
              exceptionId={selectedException || ""}
              onClose={handleCloseDetails}
              onSave={handleSaveExceptionDetails}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExceptionDashboard;