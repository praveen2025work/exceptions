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
import { 
  Download, 
  Filter, 
  RefreshCw, 
  FileText, 
  Users, 
  BarChart3,
  AlertTriangle
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Import types
interface Exception {
  id: string;
  l04_business_area_name: string;
  l06_name: string;
  named_no_name: string;
  ads_book_code: string;
  ads_book_path: string;
  system: string;
  legal_entity: string;
  regulator: string;
  instrument_id: string;
  equity_class_path: string;
  instrument_type: string;
  instrument_name: string;
  position_tbbb_classification: string;
  as_of_time: string;
  bb_underlying: string;
  reason: string;
  look_through: string;
  sod_dealt_bb_underlying: string;
  position_av: number;
  tetb_av: number;
  position_qty: number;
  tetb_qty: number;
  tetb_match: boolean;
  status: 'Unwind' | 'Centralise' | 'Writedown' | 'Insufficient Data' | 'Challenge' | 'Reassignment';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  sla_status: 'Within SLA' | 'SLA Breach' | 'SLA Warning';
  assigned_to: string;
  created_date: string;
  due_date: string;
  aging_days: number;
}

interface FilterState {
  dateFrom: string;
  dateTo: string;
  status: string;
  l04_business_area_name: string;
  l06_name: string;
  system: string;
  legal_entity: string;
  regulator: string;
  ads_book_code: string;
  priority: string;
  sla_status: string;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AdhocReports Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">Something went wrong</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  There was an error loading the reports. Please try refreshing the page.
                </p>
              </div>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Load actual exception data from JSON files
const loadExceptionData = async (): Promise<Exception[]> => {
  try {
    // Load data from both JSON files
    const [exceptionsResponse, coreExceptionsResponse] = await Promise.all([
      fetch('/src/data/exceptions.json'),
      fetch('/src/data/core-exceptions.json')
    ]);

    let allExceptions: Exception[] = [];

    // Process exceptions.json data
    if (exceptionsResponse.ok) {
      const exceptionsData = await exceptionsResponse.json();
      const processedExceptions = exceptionsData.exceptions?.map((exc: any, index: number) => ({
        id: exc.id || `EXC-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
        l04_business_area_name: exc.l04_business_area_name || 'Unknown',
        l06_name: exc.l06_name || 'Unknown',
        named_no_name: exc.named_no_name || exc.l06_name || 'Unknown',
        ads_book_code: exc.ads_book_code || 'N/A',
        ads_book_path: exc.ads_book_path || 'N/A',
        system: exc.system || 'Unknown',
        legal_entity: exc.legal_entity || 'Unknown',
        regulator: exc.regulator || 'Unknown',
        instrument_id: exc.instrument_id || 'N/A',
        equity_class_path: exc.equity_class_path || 'N/A',
        instrument_type: exc.instrument_type || 'Unknown',
        instrument_name: exc.instrument_name || 'Unknown',
        position_tbbb_classification: exc.position_tbbb_classification || 'Unknown',
        as_of_time: exc.as_of_time || new Date().toISOString(),
        bb_underlying: exc.bb_underlying || 'N/A',
        reason: exc.reason || 'No reason provided',
        look_through: exc.look_through || 'N/A',
        sod_dealt_bb_underlying: exc.sod_dealt_bb_underlying || 'N/A',
        position_av: parseFloat(exc.position_av) || 0,
        tetb_av: parseFloat(exc.tetb_av) || 0,
        position_qty: parseFloat(exc.position_qty) || 0,
        tetb_qty: parseFloat(exc.tetb_qty) || 0,
        tetb_match: exc.tetb_match === true || exc.tetb_match === 'true',
        // Map old status values to new ones
        status: mapStatus(exc.status) as Exception['status'],
        priority: exc.priority || 'Medium',
        sla_status: exc.sla_status || 'Within SLA',
        assigned_to: exc.assigned_to || 'Unassigned',
        created_date: exc.created_date || new Date().toISOString(),
        due_date: exc.due_date || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        aging_days: exc.aging_days || calculateAgingDays(exc.created_date)
      })) || [];

      allExceptions = [...allExceptions, ...processedExceptions];
    }

    // Process core-exceptions.json data
    if (coreExceptionsResponse.ok) {
      const coreExceptionsData = await coreExceptionsResponse.json();
      const processedCoreExceptions = coreExceptionsData?.map((exc: any, index: number) => ({
        id: `CORE-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
        l04_business_area_name: exc.L04_BUSINESS_AREA_NAME || 'Unknown',
        l06_name: exc.L06_NAME || 'Unknown',
        named_no_name: exc.NAMEDPNL_NAME || exc.L06_NAME || 'Unknown',
        ads_book_code: exc['SDS Book Code'] || 'N/A',
        ads_book_path: exc['SDS Book Path'] || 'N/A',
        system: exc.System || 'Unknown',
        legal_entity: exc['Legal Entity'] || 'Unknown',
        regulator: exc.Regulator || 'Unknown',
        instrument_id: exc['Instrument Id'] || 'N/A',
        equity_class_path: exc['Equity Class Type'] || 'N/A',
        instrument_type: exc['Instrument Type'] || 'Unknown',
        instrument_name: exc['Instrument Name'] || 'Unknown',
        position_tbbb_classification: exc['Position TBBB Classification'] || 'Unknown',
        as_of_time: exc['As of time'] || new Date().toISOString(),
        bb_underlying: exc['BB Underlyings'] || 'N/A',
        reason: exc.Reason || 'No reason provided',
        look_through: exc['Look through'] || 'N/A',
        sod_dealt_bb_underlying: exc['SOD Delta on BB Underlying'] || 'N/A',
        position_av: parseFloat(exc['Position AV']) || 0,
        tetb_av: parseFloat(exc['TETB AV']) || 0,
        position_qty: parseFloat(exc['Position Qty']) || 0,
        tetb_qty: parseFloat(exc['TETB Qty']) || 0,
        tetb_match: exc['TETB Match'] === 'Match',
        // Assign random status for core data
        status: getRandomStatus() as Exception['status'],
        priority: getRandomPriority() as Exception['priority'],
        sla_status: getRandomSLAStatus() as Exception['sla_status'],
        assigned_to: getRandomAssignee(),
        created_date: exc['As of time'] || new Date().toISOString(),
        due_date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        aging_days: Math.floor(Math.random() * 30)
      })) || [];

      allExceptions = [...allExceptions, ...processedCoreExceptions];
    }

    return allExceptions;
  } catch (error) {
    console.error('Error loading exception data:', error);
    // Return fallback sample data if loading fails
    return getFallbackData();
  }
};

// Helper functions
const mapStatus = (oldStatus: string): string => {
  const statusMap: { [key: string]: string } = {
    'Open': 'Challenge',
    'In Progress': 'Reassignment',
    'Resolved': 'Centralise',
    'Closed': 'Writedown'
  };
  return statusMap[oldStatus] || oldStatus || 'Challenge';
};

const calculateAgingDays = (createdDate: string): number => {
  if (!createdDate) return 0;
  const created = new Date(createdDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getRandomStatus = (): string => {
  const statuses = ['Unwind', 'Centralise', 'Writedown', 'Insufficient Data', 'Challenge', 'Reassignment'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getRandomPriority = (): string => {
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  return priorities[Math.floor(Math.random() * priorities.length)];
};

const getRandomSLAStatus = (): string => {
  const slaStatuses = ['Within SLA', 'SLA Breach', 'SLA Warning'];
  return slaStatuses[Math.floor(Math.random() * slaStatuses.length)];
};

const getRandomAssignee = (): string => {
  const assignees = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez'];
  return assignees[Math.floor(Math.random() * assignees.length)];
};

const getFallbackData = (): Exception[] => {
  return [
    {
      id: "EXC-2025-001",
      l04_business_area_name: "Equity Derivatives",
      l06_name: "Flow Derivatives Americas",
      named_no_name: "Flow Derivatives Americas",
      ads_book_code: "954807",
      ads_book_path: "Barclays Group:Markets: Equities:Equity De",
      system: "AMM",
      legal_entity: "BCINC",
      regulator: "FRB",
      instrument_id: "1004592601",
      equity_class_path: "Equity Option (Ex)",
      instrument_type: "ESM",
      instrument_name: "IWM 20Jun25 CAC 240 QUSA",
      position_tbbb_classification: "Uncertain",
      as_of_time: "2025-04-01T22:22:50.3812",
      bb_underlying: "Sophis/ 67552599/ IWM. P",
      reason: "[RuleEvaluationResult (ruleIdentifier=001, result=No",
      look_through: "y",
      sod_dealt_bb_underlying: "-2571066.384",
      position_av: -101132.334,
      tetb_av: -101132.33,
      position_qty: -3000,
      tetb_qty: -3000,
      tetb_match: true,
      status: "Challenge",
      priority: "High",
      sla_status: "SLA Breach",
      assigned_to: "John Smith",
      created_date: "2025-04-01T22:22:50.3812",
      due_date: "2025-04-03T22:22:50.3812",
      aging_days: 5
    }
  ];
};

const AdhocReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState("exceptions");
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [filteredData, setFilteredData] = useState<Exception[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: "",
    dateTo: "",
    status: "",
    l04_business_area_name: "",
    l06_name: "",
    system: "",
    legal_entity: "",
    regulator: "",
    ads_book_code: "",
    priority: "",
    sla_status: "",
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await loadExceptionData();
        setExceptions(data);
        setFilteredData(data);
      } catch (error) {
        console.error('Error loading data in AdhocReports:', error);
        setError('Failed to load exception data');
        setExceptions([]);
        setFilteredData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    if (exceptions.length === 0) return;
    
    try {
      let filtered = [...exceptions];

      // Apply date filters
      if (filters.dateFrom) {
        filtered = filtered.filter(exc => {
          try {
            return exc.created_date && new Date(exc.created_date) >= new Date(filters.dateFrom);
          } catch {
            return false;
          }
        });
      }
      if (filters.dateTo) {
        filtered = filtered.filter(exc => {
          try {
            return exc.created_date && new Date(exc.created_date) <= new Date(filters.dateTo);
          } catch {
            return false;
          }
        });
      }

      // Apply other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'dateFrom' && key !== 'dateTo') {
          filtered = filtered.filter(exc => {
            try {
              const excValue = exc[key as keyof Exception];
              return excValue && excValue.toString().toLowerCase().includes(value.toLowerCase());
            } catch {
              return false;
            }
          });
        }
      });

      setFilteredData(filtered);
    } catch (error) {
      console.error('Error applying filters:', error);
      setFilteredData(exceptions);
    }
  }, [filters, exceptions]);

  const handleFilterChange = (filterName: keyof FilterState, value: string) => {
    try {
      setFilters(prev => ({
        ...prev,
        [filterName]: value,
      }));
    } catch (error) {
      console.error('Error updating filter:', error);
    }
  };

  const clearFilters = () => {
    try {
      setFilters({
        dateFrom: "",
        dateTo: "",
        status: "",
        l04_business_area_name: "",
        l06_name: "",
        system: "",
        legal_entity: "",
        regulator: "",
        ads_book_code: "",
        priority: "",
        sla_status: "",
      });
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  const downloadReport = (downloadAll: boolean = false) => {
    try {
      const dataToDownload = downloadAll ? exceptions : filteredData;
      const reportName = selectedReport === "exceptions" ? "Exceptions Report" : 
                        selectedReport === "reassignment" ? "Reassignment Report" : "TPRT Report";
      
      // Create comprehensive CSV content
      const headers = [
        "Exception ID",
        "L04 Business Area",
        "L06 Name",
        "Named/No Name",
        "Status",
        "Priority",
        "SLA Status",
        "System",
        "Legal Entity",
        "Regulator",
        "ADS Book Code",
        "ADS Book Path",
        "Instrument ID",
        "Instrument Type",
        "Instrument Name",
        "Equity Class Path",
        "Position TBBB Classification",
        "Position AV",
        "TETB AV",
        "Position Qty",
        "TETB Qty",
        "TETB Match",
        "BB Underlying",
        "Look Through",
        "SOD Dealt BB Underlying",
        "Assigned To",
        "Aging Days",
        "Created Date",
        "Due Date",
        "As Of Time",
        "Reason"
      ];

      const csvContent = [
        headers.join(","),
        ...dataToDownload.map(exc => [
          exc.id || "",
          exc.l04_business_area_name || "",
          exc.l06_name || "",
          exc.named_no_name || "",
          exc.status || "",
          exc.priority || "",
          exc.sla_status || "",
          exc.system || "",
          exc.legal_entity || "",
          exc.regulator || "",
          exc.ads_book_code || "",
          exc.ads_book_path || "",
          exc.instrument_id || "",
          exc.instrument_type || "",
          exc.instrument_name || "",
          exc.equity_class_path || "",
          exc.position_tbbb_classification || "",
          exc.position_av || 0,
          exc.tetb_av || 0,
          exc.position_qty || 0,
          exc.tetb_qty || 0,
          exc.tetb_match ? "Match" : "Mismatch",
          exc.bb_underlying || "",
          exc.look_through || "",
          exc.sod_dealt_bb_underlying || "",
          exc.assigned_to || "",
          exc.aging_days || 0,
          exc.created_date || "",
          exc.due_date || "",
          exc.as_of_time || "",
          exc.reason || ""
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${reportName}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const getUniqueValues = (field: keyof Exception): string[] => {
    try {
      const values = exceptions
        .map(exc => exc[field])
        .filter((value, index, self) => value && self.indexOf(value) === index)
        .sort();
      return values as string[];
    } catch (error) {
      console.error('Error getting unique values:', error);
      return [];
    }
  };

  const renderFilters = () => (
    <Card className="mb-2">
      <CardHeader className="pb-2 pt-2 px-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {/* Date Filters */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Date From</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Date To</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Status</label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="Unwind">Unwind</SelectItem>
                <SelectItem value="Centralise">Centralise</SelectItem>
                <SelectItem value="Writedown">Writedown</SelectItem>
                <SelectItem value="Insufficient Data">Insufficient Data</SelectItem>
                <SelectItem value="Challenge">Challenge</SelectItem>
                <SelectItem value="Reassignment">Reassignment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* L04 Business Area Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium">L04 Business Area</label>
            <Select value={filters.l04_business_area_name} onValueChange={(value) => handleFilterChange("l04_business_area_name", value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Areas</SelectItem>
                {getUniqueValues("l04_business_area_name").map(value => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Priority</label>
            <Select value={filters.priority} onValueChange={(value) => handleFilterChange("priority", value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* System Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium">System</label>
            <Select value={filters.system} onValueChange={(value) => handleFilterChange("system", value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Systems" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Systems</SelectItem>
                {getUniqueValues("system").map(value => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Second row of filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
          {/* L06 Name Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium">L06 Name</label>
            <Select value={filters.l06_name} onValueChange={(value) => handleFilterChange("l06_name", value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All L06" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All L06</SelectItem>
                {getUniqueValues("l06_name").map(value => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Legal Entity Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Legal Entity</label>
            <Select value={filters.legal_entity} onValueChange={(value) => handleFilterChange("legal_entity", value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Entities</SelectItem>
                {getUniqueValues("legal_entity").map(value => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Regulator Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Regulator</label>
            <Select value={filters.regulator} onValueChange={(value) => handleFilterChange("regulator", value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Regulators" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Regulators</SelectItem>
                {getUniqueValues("regulator").map(value => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SLA Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium">SLA Status</label>
            <Select value={filters.sla_status} onValueChange={(value) => handleFilterChange("sla_status", value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All SLA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All SLA</SelectItem>
                <SelectItem value="Within SLA">Within SLA</SelectItem>
                <SelectItem value="SLA Breach">SLA Breach</SelectItem>
                <SelectItem value="SLA Warning">SLA Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ADS Book Code Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium">ADS Book Code</label>
            <Input
              type="text"
              placeholder="Search book code..."
              value={filters.ads_book_code}
              onChange={(e) => handleFilterChange("ads_book_code", e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          {/* Empty space for alignment */}
          <div></div>
        </div>

        <div className="flex justify-between items-center mt-3 pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Showing {filteredData.length} of {exceptions.length} records
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadReport(false)}>
              <Download className="h-3 w-3 mr-1" />
              Download Filtered
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadReport(true)}>
              <Download className="h-3 w-3 mr-1" />
              Download All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderExceptionsReport = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading exception data...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">Error Loading Data</h3>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
              </div>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (exceptions.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No exception data available</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-2">
        {renderFilters()}
        
        <Card>
          <CardHeader className="pb-2 pt-2 px-2">
            <CardTitle className="text-sm">Exception Data</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sticky left-0 bg-background">Exception ID</TableHead>
                    <TableHead className="text-xs">L04 Business Area</TableHead>
                    <TableHead className="text-xs">L06 Name</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Priority</TableHead>
                    <TableHead className="text-xs">SLA Status</TableHead>
                    <TableHead className="text-xs">System</TableHead>
                    <TableHead className="text-xs">Legal Entity</TableHead>
                    <TableHead className="text-xs">Regulator</TableHead>
                    <TableHead className="text-xs">Instrument ID</TableHead>
                    <TableHead className="text-xs">Instrument Type</TableHead>
                    <TableHead className="text-xs">Instrument Name</TableHead>
                    <TableHead className="text-xs">Position AV</TableHead>
                    <TableHead className="text-xs">TETB AV</TableHead>
                    <TableHead className="text-xs">Position Qty</TableHead>
                    <TableHead className="text-xs">TETB Qty</TableHead>
                    <TableHead className="text-xs">TETB Match</TableHead>
                    <TableHead className="text-xs">Assigned To</TableHead>
                    <TableHead className="text-xs">Aging Days</TableHead>
                    <TableHead className="text-xs">Created Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={20} className="text-center text-xs text-muted-foreground py-8">
                        No data matches the current filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((exception) => (
                      <TableRow key={exception.id}>
                        <TableCell className="text-xs font-mono sticky left-0 bg-background">{exception.id || 'N/A'}</TableCell>
                        <TableCell className="text-xs">{exception.l04_business_area_name || 'N/A'}</TableCell>
                        <TableCell className="text-xs">{exception.l06_name || 'N/A'}</TableCell>
                        <TableCell className="text-xs">
                          <Badge 
                            variant={
                              exception.status === 'Unwind' || exception.status === 'Centralise' || exception.status === 'Writedown' 
                                ? 'secondary' 
                                : exception.status === 'Challenge' || exception.status === 'Insufficient Data'
                                ? 'destructive'
                                : 'outline'
                            }
                            className="text-xs"
                          >
                            {exception.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge 
                            variant={
                              exception.priority === 'Critical' ? 'destructive' :
                              exception.priority === 'High' ? 'destructive' :
                              exception.priority === 'Medium' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {exception.priority || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge 
                            variant={exception.sla_status === 'SLA Breach' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {exception.sla_status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{exception.system || 'N/A'}</TableCell>
                        <TableCell className="text-xs">{exception.legal_entity || 'N/A'}</TableCell>
                        <TableCell className="text-xs">{exception.regulator || 'N/A'}</TableCell>
                        <TableCell className="text-xs font-mono">{exception.instrument_id || 'N/A'}</TableCell>
                        <TableCell className="text-xs">{exception.instrument_type || 'N/A'}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate" title={exception.instrument_name || 'N/A'}>
                          {exception.instrument_name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          {exception.position_av ? exception.position_av.toLocaleString() : '0'}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          {exception.tetb_av ? exception.tetb_av.toLocaleString() : '0'}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          {exception.position_qty ? exception.position_qty.toLocaleString() : '0'}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          {exception.tetb_qty ? exception.tetb_qty.toLocaleString() : '0'}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge 
                            variant={exception.tetb_match ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {exception.tetb_match ? 'Match' : 'Mismatch'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{exception.assigned_to || 'Unassigned'}</TableCell>
                        <TableCell className="text-xs">
                          <Badge 
                            variant={
                              exception.aging_days <= 7 ? 'secondary' :
                              exception.aging_days <= 14 ? 'outline' :
                              exception.aging_days <= 30 ? 'secondary' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {exception.aging_days || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {exception.created_date ? new Date(exception.created_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReassignmentReport = () => {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <Users className="h-8 w-8 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Reassignment Report</h3>
              <p className="text-sm text-muted-foreground mt-2">
                This report will show reassignment history and analytics.
              </p>
            </div>
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPlaceholderReport = () => (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="space-y-4">
          <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">TPRT Report</h3>
            <p className="text-sm text-muted-foreground mt-2">
              This report will show TPRT (Third Party Risk Tracking) data and metrics.
            </p>
          </div>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary>
      <div className="bg-background p-2 h-full w-full">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Adhoc Reports</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Report Type Selection */}
        <Card className="mb-2">
          <CardContent className="p-2">
            <Tabs value={selectedReport} onValueChange={setSelectedReport}>
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

              <TabsContent value="exceptions" className="mt-4">
                <ErrorBoundary>
                  {renderExceptionsReport()}
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="reassignment" className="mt-4">
                <ErrorBoundary>
                  {renderReassignmentReport()}
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="tprt" className="mt-4">
                <ErrorBoundary>
                  {renderPlaceholderReport()}
                </ErrorBoundary>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default AdhocReports;