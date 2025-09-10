import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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

// Memoized metric calculation functions
const calculateMetrics = (exceptions: Exception[]): ExceptionMetric[] => {
  const totalExceptions = exceptions.length;
  const completedToday = exceptions.filter(exc => 
    exc.status === 'Resolved' && 
    new Date(exc.created_date).toDateString() === new Date().toDateString()
  ).length;
  const slaBreaches = exceptions.filter(exc => exc.sla_status === 'SLA Breach').length;
  const pendingReview = exceptions.filter(exc => exc.status === 'In Progress' || exc.status === 'Open').length;

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

// Memoized MetricCard component
const MetricCard = React.memo<{ metrics: ExceptionMetric[] }>(({ metrics }) => (
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
));

MetricCard.displayName = 'MetricCard';

// Memoized AgingCard component
const AgingCard = React.memo<{ agingMetrics: AgingMetric[] }>(({ agingMetrics }) => {
  const getProgressColor = useCallback((label: string) => {
    if (label.includes("0-7")) return "bg-green-500";
    if (label.includes("8-14")) return "bg-yellow-500";
    if (label.includes("15-30")) return "bg-orange-500";
    return "bg-red-500";
  }, []);

  return (
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
          {agingMetrics.map((metric, index) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

AgingCard.displayName = 'AgingCard';

const ExceptionDashboard: React.FC<ExceptionDashboardProps> = ({
  metrics: propMetrics,
  agingMetrics: propAgingMetrics,
}) => {
  const [selectedException, setSelectedException] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showMetricsAndAging, setShowMetricsAndAging] = useState(true);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [workflowStatus, setWorkflowStatus] = useState<Record<string, string>>({});
  const detailsPanelRef = useRef<HTMLDivElement>(null);

  // Memoized metrics calculations
  const metrics = useMemo(() => {
    if (propMetrics) return propMetrics;
    return calculateMetrics(exceptions);
  }, [propMetrics, exceptions]);

  const agingMetrics = useMemo(() => {
    if (propAgingMetrics) return propAgingMetrics;
    return calculateAgingMetrics(exceptions);
  }, [propAgingMetrics, exceptions]);

  // Load data only once on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        const fetchedExceptions = await fetchAndTransformExceptions();
        
        if (isMounted) {
          setExceptions(fetchedExceptions);
        }
      } catch (error) {
        console.error('Failed to load exceptions:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Memoized event handlers
  const handleExceptionSelect = useCallback((exception: any) => {
    setSelectedException(exception.id);
    setShowDetails(true);
    setShowMetricsAndAging(false);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedException(null);
  }, []);

  const handleSaveExceptionDetails = useCallback((updatedData: any) => {
    if (selectedException) {
      console.log("Saving exception details:", updatedData);
      setWorkflowStatus((prev) => ({
        ...prev,
        [selectedException]: updatedData.status,
      }));
    }
  }, [selectedException]);

  const handleToggleMetricsAndAging = useCallback(() => {
    setShowMetricsAndAging(prev => !prev);
  }, []);

  const handleBulkAction = useCallback((action: string, exceptionIds: string[]) => {
    if (action === "assign") {
      console.log("Assigning exceptions:", exceptionIds);
    } else if (action === "update-status") {
      console.log("Updating status for exceptions:", exceptionIds);
    } else if (action === "trigger-workflow") {
      console.log("Triggering workflow for exceptions:", exceptionIds);
      const newWorkflowStatus = { ...workflowStatus };
      exceptionIds.forEach((id) => {
        newWorkflowStatus[id] = "In Progress";
      });
      setWorkflowStatus(newWorkflowStatus);
      
      // Batch update exceptions
      setExceptions((prev) =>
        prev.map((exception) =>
          exceptionIds.includes(exception.id)
            ? { ...exception, status: "In Progress" as const }
            : exception
        )
      );
    }
  }, [workflowStatus]);

  return (
    <div className="h-full flex bg-background">
      {/* Main Content Area - Uses flex-1 to take remaining space */}
      <div className={`transition-all duration-300 flex-1 flex flex-col min-w-0 ${showDetails ? 'mr-0' : ''}`}>
        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {showMetricsAndAging && (
            <div className="p-6 pb-4">
              <div className={`grid gap-6 ${showDetails ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                <MetricCard metrics={metrics} />
                <AgingCard agingMetrics={agingMetrics} />
              </div>
            </div>
          )}
          
          {/* Exception List - Full Height */}
          <div className="flex-1 overflow-hidden px-6 pb-6">
            <Card className="h-full border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
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

      {/* Details Panel - Fixed width when open */}
      <div 
        ref={detailsPanelRef}
        className={`transition-all duration-300 ${showDetails ? 'w-96 flex-shrink-0' : 'w-0'} overflow-hidden border-l bg-background/50`}
      >
        {showDetails && selectedException && (
          <div className="h-full">
            <ExceptionDetails
              exceptionId={selectedException}
              onClose={handleCloseDetails}
              onSave={handleSaveExceptionDetails}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ExceptionDashboard);