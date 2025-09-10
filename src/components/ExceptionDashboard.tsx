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
  const [selectedTab, setSelectedTab] = useState("bankingbook");
  const [selectedException, setSelectedException] = useState<string | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [showMetricsAndAging, setShowMetricsAndAging] = useState(true);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [filteredExceptions, setFilteredExceptions] = useState<Exception[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    let filtered = exceptions;
    if (selectedTab === 'bankingbook') {
      // This is a placeholder. Replace with actual logic for "BankingBook"
      filtered = exceptions.filter(e => e.position_tbbb_classification === 'BankingBook');
    } else if (selectedTab === 'uncertain') {
      // This is a placeholder. Replace with actual logic for "Uncertain"
      filtered = exceptions.filter(e => e.position_tbbb_classification === 'Uncertain');
    } else if (selectedTab === 'centraliseAndWritedown') {
      filtered = exceptions.filter(e => e.status === 'Centralise' || e.status === 'Writedown');
    }
    setFilteredExceptions(filtered);
  }, [selectedTab, exceptions]);

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
    setShowMetricsAndAging(true);
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
    <div className="bg-background w-full flex">
      <div className={`transition-all duration-300 ${showDetails ? 'w-2/3' : 'w-full'}`}>
        <div className="flex justify-end items-center mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8" onClick={() => setShowMetricsAndAging(prev => !prev)} title={showMetricsAndAging ? 'Hide Summary' : 'Show Summary'}>
              {showMetricsAndAging ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {showMetricsAndAging && (
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
                  {agingMetrics.map((metric, index) => {
                    const getProgressColor = (label: string) => {
                      if (label.includes("0-7")) return "bg-green-500";
                      if (label.includes("8-14")) return "bg-yellow-500";
                      if (label.includes("15-30")) return "bg-orange-500";
                      return "bg-red-500";
                    };

                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{metric.label}</span>
                          <span>{metric.count} ({metric.percentage}%)</span>
                        </div>
                        <Progress value={metric.percentage} className="h-2" indicatorClassName={getProgressColor(metric.label)} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            </div>
          )}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium">Exception List</CardTitle>
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-auto">
                  <TabsList className="h-8">
                    <TabsTrigger value="bankingbook" className="text-xs px-2">BankingBook</TabsTrigger>
                    <TabsTrigger value="uncertain" className="text-xs px-2">Uncertain</TabsTrigger>
                    <TabsTrigger value="centraliseAndWritedown" className="text-xs px-2">CentraliseAndWritedown</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <ExceptionList
                exceptions={filteredExceptions}
                isLoading={isLoading}
                onExceptionSelect={handleExceptionSelect}
                onBulkAction={handleBulkAction}
                filters={filters}
                workflowStatus={workflowStatus}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className={`transition-all duration-300 ${showDetails ? 'w-1/3' : 'w-0'} overflow-hidden`}>
        {showDetails && (
          <div className="bg-background border-l h-full">
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