import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  MoreHorizontal,
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Exception, ExceptionFilters } from "@/types/exception";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useApiService } from "@/utils/apiService";
import { useUser } from "@/contexts/UserContext";
import { useLoading } from "@/contexts/LoadingContext";
import { toast } from "@/components/ui/use-toast";

interface ExceptionListProps {
  exceptions: Exception[];
  isLoading: boolean;
  onExceptionSelect?: (exception: Exception) => void;
  onBulkAction?: (action: string, exceptionIds: string[]) => void;
  filters?: ExceptionFilters;
  workflowStatus?: Record<string, string>;
  showMetricsAndAging?: boolean;
  onToggleMetricsAndAging?: () => void;
}

// Memoized utility functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};

// Memoized color functions
const getSLAStatusColor = (status: string) => {
  switch (status) {
    case "Within SLA":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ocean:bg-green-200/70 ocean:text-green-900 modern:bg-green-900/40 modern:text-green-400";
    case "SLA Warning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 ocean:bg-yellow-200/70 ocean:text-yellow-900 modern:bg-yellow-900/40 modern:text-yellow-400";
    case "SLA Breach":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ocean:bg-red-200/70 ocean:text-red-900 modern:bg-red-900/40 modern:text-red-400";
    default:
      return "";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Low":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 ocean:bg-blue-200/70 ocean:text-blue-900 modern:bg-blue-900/40 modern:text-blue-400";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 ocean:bg-yellow-200/70 ocean:text-yellow-900 modern:bg-yellow-900/40 modern:text-yellow-400";
    case "High":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 ocean:bg-orange-200/70 ocean:text-orange-900 modern:bg-orange-900/40 modern:text-orange-400";
    case "Critical":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ocean:bg-red-200/70 ocean:text-red-900 modern:bg-red-900/40 modern:text-red-400";
    default:
      return "";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 ocean:bg-blue-200/70 ocean:text-blue-900 modern:bg-blue-900/40 modern:text-blue-400";
    case "In Progress":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 ocean:bg-yellow-200/70 ocean:text-yellow-900 modern:bg-yellow-900/40 modern:text-yellow-400";
    case "Resolved":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ocean:bg-green-200/70 ocean:text-green-900 modern:bg-green-900/40 modern:text-green-400";
    case "Rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ocean:bg-red-200/70 ocean:text-red-900 modern:bg-red-900/40 modern:text-red-400";
    default:
      return "";
  }
};

// Memoized table row component
const ExceptionRow = React.memo<{
  exception: Exception;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onToggleExpand: (id: string) => void;
  onExceptionSelect: (exception: Exception) => void;
  onBulkAction: (action: string, exceptionIds: string[]) => void;
}>(({ exception, isSelected, isExpanded, onSelect, onToggleExpand, onExceptionSelect, onBulkAction }) => (
  <>
    <TableRow
      className="cursor-pointer hover:bg-muted/30 border-b"
      onClick={() => onExceptionSelect(exception)}
    >
      <TableCell className="p-2" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(exception.id, !!checked)}
        />
      </TableCell>
      <TableCell className="text-xs">{exception.ads_book_code}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
          {exception.system}
        </Badge>
      </TableCell>
      <TableCell className="text-xs">{exception.legal_entity}</TableCell>
      <TableCell className="font-mono text-xs">{exception.instrument_id}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
          {exception.position_tbbb_classification}
        </Badge>
      </TableCell>
      <TableCell className="text-right text-xs font-mono">{formatNumber(exception.position_qty)}</TableCell>
      <TableCell className="text-right text-xs font-mono">{formatNumber(exception.tetb_qty)}</TableCell>
      <TableCell>
        <Badge className={`text-xs px-1.5 py-0.5 ${getStatusColor(exception.status)}`}>
          {exception.status}
        </Badge>
      </TableCell>
      <TableCell className="text-center text-xs font-mono">{exception.aging_days}</TableCell>
      <TableCell className="text-xs">{exception.categoryName || 'N/A'}</TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(exception.id);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onExceptionSelect(exception);
              }}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onBulkAction("assign", [exception.id]);
              }}>
                Assign
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onBulkAction("trigger-workflow", [exception.id]);
              }}>
                Start Workflow
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
    {isExpanded && (
      <TableRow>
        <TableCell colSpan={12} className="bg-muted/20 p-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium mb-2 text-xs text-muted-foreground uppercase tracking-wide">Business Information</h4>
              <div className="space-y-1 text-xs">
                <p><span className="font-medium">Status:</span> <Badge className={`text-xs px-1.5 py-0.5 ${getStatusColor(exception.status)}`}>{exception.status || 'null'}</Badge></p>
                <p><span className="font-medium">Aging:</span> {exception.aging_days}</p>
                <p><span className="font-medium">Processed Exceptions:</span> {new Date(exception.created_date).toLocaleString()}</p>
                <p><span className="font-medium">SDS Book Code:</span> {exception.ads_book_code}</p>
                <p><span className="font-medium">SDS Book Path:</span> {exception.ads_book_path}</p>
                <p><span className="font-medium">System:</span> {exception.system}</p>
                <p><span className="font-medium">Legal Entity:</span> {exception.legal_entity}</p>
                <p><span className="font-medium">Regulator:</span> {exception.regulator}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-xs text-muted-foreground uppercase tracking-wide">Instrument Details</h4>
              <div className="space-y-1 text-xs">
                <p><span className="font-medium">Instrument ID:</span> {exception.instrument_id}</p>
                <p><span className="font-medium">Equity Class Type:</span> {exception.equity_class_path?.split('/').pop() || 'N/A'}</p>
                <p><span className="font-medium">Instrument Type:</span> {exception.instrument_type}</p>
                <p><span className="font-medium">Instrument Name:</span> {exception.instrument_name}</p>
                <p><span className="font-medium">Position TBBB Classification:</span> {exception.position_tbbb_classification}</p>
                <p><span className="font-medium">As Of Time:</span> {new Date(exception.as_of_time).toLocaleString()}</p>
                <p><span className="font-medium">BB Underlyings:</span> {exception.bb_underlying}</p>
                <p><span className="font-medium">ESM Security Type:</span> {exception.equity_class_path?.split('/').pop() || 'N/A'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-xs text-muted-foreground uppercase tracking-wide">Position & Valuation</h4>
              <div className="space-y-1 text-xs">
                <p><span className="font-medium">SOD Delta on BB Underlying:</span> {formatCurrency(exception.position_av)}</p>
                <p><span className="font-medium">Position AV:</span> {formatCurrency(exception.position_av)}</p>
                <p><span className="font-medium">Position Qty:</span> {formatNumber(exception.position_qty)}</p>
                <p><span className="font-medium">Look Through:</span> {exception.look_through}</p>
                <p><span className="font-medium">Original Qty:</span> {formatNumber(exception.tetb_qty)}</p>
                <p><span className="font-medium">Category ID:</span> {exception.categoryId || 'null'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-xs text-muted-foreground uppercase tracking-wide">Exception ID</h4>
              <div className="space-y-1 text-xs">
                <p><span className="font-medium">Exception ID:</span> {exception.id}</p>
              </div>
            </div>
          </div>
        </TableCell>
      </TableRow>
    )}
  </>
));

ExceptionRow.displayName = 'ExceptionRow';

const ExceptionList: React.FC<ExceptionListProps> = ({
  exceptions,
  isLoading,
  onExceptionSelect = () => {},
  onBulkAction = () => {},
  filters: propFilters = {
    ads_book_code: "",
    system: "",
    legal_entity: "",
    regulator: "",
    status: "",
    l04_business_area_name: "",
    l06_name: "",
    instrument_id: "",
  },
  workflowStatus = {},
  showMetricsAndAging = true,
  onToggleMetricsAndAging = () => {},
}) => {
  const [selectedExceptions, setSelectedExceptions] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Exception>("created_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(propFilters);
  const [classificationFilter, setClassificationFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const apiService = useApiService();
  const { user } = useUser();
  const { setLoading } = useLoading();

  const itemsPerPage = 100;

  useEffect(() => {
    setFilters(propFilters);
  }, [propFilters]);

  // Memoized unique values for dropdowns
  const uniqueValues = useMemo(() => ({
    systems: Array.from(new Set(exceptions.map(e => e.system).filter(Boolean))),
    legalEntities: Array.from(new Set(exceptions.map(e => e.legal_entity).filter(Boolean))),
    regulators: Array.from(new Set(exceptions.map(e => e.regulator).filter(Boolean))),
    statuses: Array.from(new Set(exceptions.map(e => e.status).filter(Boolean))),
  }), [exceptions]);

  // Memoized filtered and sorted exceptions
  const processedExceptions = useMemo(() => {
    // Apply filters
    const filtered = exceptions.filter((exception) => {
      // Search functionality
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchableFields = [
          exception.id,
          exception.instrument_id,
          exception.ads_book_code,
          exception.instrument_name,
          exception.l04_business_area_name,
          exception.l06_name,
          exception.named_no_name,
          exception.system,
          exception.legal_entity,
          exception.regulator,
          exception.status,
          exception.priority,
          exception.assigned_to,
          exception.reason,
          exception.categoryName
        ].filter(Boolean);
        
        const matchesSearch = searchableFields.some(field => 
          field?.toString().toLowerCase().includes(searchLower)
        );
        
        if (!matchesSearch) return false;
      }

      // Apply text filters with && and || support
      const bookCodeFilter = filters.ads_book_code?.trim();
      const instrumentIdFilter = (filters as any).instrument_id?.trim();
      
      if (bookCodeFilter || instrumentIdFilter) {
        const evaluateFilter = (filterValue: string, fieldValue: string) => {
          if (!filterValue) return true;
          
          // Check for && operator
          if (filterValue.includes('&&')) {
            const terms = filterValue.split('&&').map(term => term.trim().toLowerCase());
            return terms.every(term => fieldValue.toLowerCase().includes(term));
          }
          
          // Check for || operator
          if (filterValue.includes('||')) {
            const terms = filterValue.split('||').map(term => term.trim().toLowerCase());
            return terms.some(term => fieldValue.toLowerCase().includes(term));
          }
          
          // Default single term search
          return fieldValue.toLowerCase().includes(filterValue.toLowerCase());
        };
        
        const bookCodeMatch = bookCodeFilter ? evaluateFilter(bookCodeFilter, exception.ads_book_code || '') : true;
        const instrumentIdMatch = instrumentIdFilter ? evaluateFilter(instrumentIdFilter, exception.instrument_id || '') : true;

        // Apply filters independently - both must pass if they have values
        if (bookCodeFilter && !bookCodeMatch) {
          return false;
        }
        if (instrumentIdFilter && !instrumentIdMatch) {
          return false;
        }
      }

      // Apply classification filter
      if (
        classificationFilter &&
        classificationFilter !== "all" &&
        exception.position_tbbb_classification !== classificationFilter
      ) {
        return false;
      }

      // Apply dropdown filters
      if (
        filters.system &&
        filters.system !== "all" &&
        exception.system !== filters.system
      ) {
        return false;
      }
      if (
        filters.legal_entity &&
        filters.legal_entity !== "all" &&
        exception.legal_entity !== filters.legal_entity
      ) {
        return false;
      }
      if (
        filters.regulator &&
        filters.regulator !== "all" &&
        exception.regulator !== filters.regulator
      ) {
        return false;
      }
      if (
        filters.status &&
        filters.status !== "all" &&
        exception.status !== filters.status
      ) {
        return false;
      }
      
      return true;
    });

    // Sort filtered exceptions
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined || bValue === undefined || aValue === null || bValue === null) {
        return 0;
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [exceptions, searchTerm, filters, classificationFilter, sortField, sortDirection]);

  // Memoized pagination
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(processedExceptions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedExceptions = processedExceptions.slice(startIndex, startIndex + itemsPerPage);
    
    return { totalPages, startIndex, paginatedExceptions };
  }, [processedExceptions, currentPage, itemsPerPage]);

  // Memoized event handlers
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await apiService.get('/api/exceptions', 'Refreshing exceptions...');
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Exception data refreshed successfully",
        });
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to refresh data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh exception data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  }, [apiService]);

  const handleDownload = useCallback(async () => {
    try {
      const response = await apiService.get('/api/exceptions/export', 'Preparing download...');
      
      if (response.success) {
        const csvData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exceptions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: "Exception data downloaded successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to download data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download exception data",
        variant: "destructive",
      });
    }
  }, [apiService]);

  const handleBulkActionWithUser = useCallback(async (action: string, exceptionIds: string[]) => {
    if (!user?.userName) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiService.post('/api/exceptions/bulk-action', {
        action,
        exceptionIds,
        performedBy: user.userName,
        timestamp: new Date().toISOString()
      }, `Performing ${action} on ${exceptionIds.length} exception(s)...`);

      if (response.success) {
        toast({
          title: "Success",
          description: `${action} completed successfully for ${exceptionIds.length} exception(s)`,
        });
        setSelectedExceptions([]);
        onBulkAction(action, exceptionIds);
      } else {
        toast({
          title: "Error",
          description: response.error || `Failed to perform ${action}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to perform ${action}`,
        variant: "destructive",
      });
    }
  }, [apiService, user?.userName, onBulkAction]);

  const handleSort = useCallback((field: keyof Exception) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField, sortDirection]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedExceptions(paginationData.paginatedExceptions.map((exception) => exception.id));
    } else {
      setSelectedExceptions([]);
    }
  }, [paginationData.paginatedExceptions]);

  const handleSelectException = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedExceptions(prev => [...prev, id]);
    } else {
      setSelectedExceptions(prev => prev.filter((exceptionId) => exceptionId !== id));
    }
  }, []);

  const toggleRowExpand = useCallback((id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setClassificationFilter("all");
    setFilters({
      ads_book_code: "",
      system: "",
      legal_entity: "",
      regulator: "",
      status: "",
      l04_business_area_name: "",
      l06_name: "",
      instrument_id: "",
    });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Single Row Header with All Elements */}
      <div className="px-4 py-3 border-b bg-background/30">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Title, Count, and Classification Tabs */}
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold whitespace-nowrap">Exception List</h2>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {processedExceptions.length} exceptions
            </span>
            <Tabs value={classificationFilter} onValueChange={setClassificationFilter} className="w-auto">
              <TabsList className="h-8 bg-muted/50">
                <TabsTrigger value="all" className="text-xs px-3 data-[state=active]:bg-background">All</TabsTrigger>
                <TabsTrigger value="BankingBook" className="text-xs px-3 data-[state=active]:bg-background">BankingBook</TabsTrigger>
                <TabsTrigger value="Uncertain" className="text-xs px-3 data-[state=active]:bg-background">Uncertain</TabsTrigger>
                <TabsTrigger value="CentraliseAndWritedown" className="text-xs px-3 data-[state=active]:bg-background">CentraliseAndWritedown</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Right side - Icon-based Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={onToggleMetricsAndAging}
              title={showMetricsAndAging ? "Hide Summary" : "Show Summary"}
            >
              {showMetricsAndAging ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-4 py-3 border-b bg-background/30">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Filters</h3>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 text-xs"
            onClick={clearFilters}
          >
            <Filter className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 items-end">
          <div>
            <p className="text-xs mb-1 text-muted-foreground font-medium">Book Code</p>
            <Input
              placeholder="Book code (use &&, ||)..."
              value={filters.ads_book_code}
              onChange={(e) => setFilters({ ...filters, ads_book_code: e.target.value })}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <p className="text-xs mb-1 text-muted-foreground font-medium">Instrument ID</p>
            <Input
              placeholder="Instrument ID (use &&, ||)..."
              value={(filters as any).instrument_id}
              onChange={(e) => setFilters({ ...filters, instrument_id: e.target.value })}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <p className="text-xs mb-1 text-muted-foreground font-medium">System</p>
            <Select
              value={filters.system || "all"}
              onValueChange={(value) => setFilters({...filters, system: value === "all" ? "" : value})}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="System" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Systems</SelectItem>
                {uniqueValues.systems.map(system => (
                  <SelectItem key={system} value={system}>{system}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-xs mb-1 text-muted-foreground font-medium">Legal Entity</p>
            <Select
              value={filters.legal_entity || "all"}
              onValueChange={(value) => setFilters({...filters, legal_entity: value === "all" ? "" : value})}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {uniqueValues.legalEntities.map(entity => (
                  <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-xs mb-1 text-muted-foreground font-medium">Regulator</p>
            <Select
              value={filters.regulator || "all"}
              onValueChange={(value) => setFilters({...filters, regulator: value === "all" ? "" : value})}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Regulator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regulators</SelectItem>
                {uniqueValues.regulators.map(regulator => (
                  <SelectItem key={regulator} value={regulator}>{regulator}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-xs mb-1 text-muted-foreground font-medium">Status</p>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => setFilters({...filters, status: value === "all" ? "" : value})}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Search Bar with Pagination Info */}
      <div className="flex justify-between items-center px-4 py-3 border-b bg-background/30">
        <div className="flex items-center gap-4">
          {selectedExceptions.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {selectedExceptions.length} selected
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs px-2"
                  onClick={() => handleBulkActionWithUser("assign", selectedExceptions)}
                >
                  Assign
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs px-2"
                  onClick={() => handleBulkActionWithUser("trigger-workflow", selectedExceptions)}
                >
                  Workflow
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs px-2"
                  onClick={() => setSelectedExceptions([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Showing {paginationData.startIndex + 1} to{" "}
              {Math.min(paginationData.startIndex + itemsPerPage, processedExceptions.length)} of{" "}
              {processedExceptions.length} exceptions
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {paginationData.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink isActive={true}>
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(Math.min(paginationData.totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === paginationData.totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          <div className="relative">
            <Search className="absolute left-2 top-1.5 h-3 w-3 text-muted-foreground" />
            <Input 
              placeholder="Search exceptions..." 
              className="pl-7 w-48 h-6 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Container with Sticky Header */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-30 bg-background border-b-2 border-border shadow-md">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 sticky top-0 bg-background border-b-2 border-border">
                  <Checkbox
                    checked={
                      paginationData.paginatedExceptions.length > 0 &&
                      selectedExceptions.length === paginationData.paginatedExceptions.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer sticky top-0 bg-background border-b-2 border-border min-w-[100px]"
                  onClick={() => handleSort("ads_book_code")}
                >
                  <div className="flex items-center text-xs font-semibold">
                    SDS Book Code
                    {sortField === "ads_book_code" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer sticky top-0 bg-background border-b-2 border-border min-w-[80px]"
                  onClick={() => handleSort("system")}
                >
                  <div className="flex items-center text-xs font-semibold">
                    System
                    {sortField === "system" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer sticky top-0 bg-background border-b-2 border-border min-w-[100px]"
                  onClick={() => handleSort("legal_entity")}
                >
                  <div className="flex items-center text-xs font-semibold">
                    Legal Entity
                    {sortField === "legal_entity" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer sticky top-0 bg-background border-b-2 border-border min-w-[120px]"
                  onClick={() => handleSort("instrument_id")}
                >
                  <div className="flex items-center text-xs font-semibold">
                    Instrument ID
                    {sortField === "instrument_id" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer sticky top-0 bg-background border-b-2 border-border min-w-[140px]"
                  onClick={() => handleSort("position_tbbb_classification")}
                >
                  <div className="flex items-center text-xs font-semibold">
                    Position TBBB Class
                    {sortField === "position_tbbb_classification" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer sticky top-0 bg-background border-b-2 border-border min-w-[100px] text-right"
                  onClick={() => handleSort("position_qty")}
                >
                  <div className="flex items-center justify-end text-xs font-semibold">
                    Position Qty
                    {sortField === "position_qty" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer sticky top-0 bg-background border-b-2 border-border min-w-[100px] text-right"
                  onClick={() => handleSort("tetb_qty")}
                >
                  <div className="flex items-center justify-end text-xs font-semibold">
                    Original Qty
                    {sortField === "tetb_qty" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer sticky top-0 bg-background border-b-2 border-border min-w-[100px]"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center text-xs font-semibold">
                    Status
                    {sortField === "status" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer sticky top-0 bg-background border-b-2 border-border min-w-[80px] text-center"
                  onClick={() => handleSort("aging_days")}
                >
                  <div className="flex items-center justify-center text-xs font-semibold">
                    Aging
                    {sortField === "aging_days" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer sticky top-0 bg-background border-b-2 border-border min-w-[120px]"
                  onClick={() => handleSort("categoryName")}
                >
                  <div className="flex items-center text-xs font-semibold">
                    Category
                    {sortField === "categoryName" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="w-16 sticky top-0 bg-background border-b-2 border-border text-center text-xs font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginationData.paginatedExceptions.map((exception) => (
                <ExceptionRow
                  key={exception.id}
                  exception={exception}
                  isSelected={selectedExceptions.includes(exception.id)}
                  isExpanded={expandedRows.includes(exception.id)}
                  onSelect={handleSelectException}
                  onToggleExpand={toggleRowExpand}
                  onExceptionSelect={onExceptionSelect}
                  onBulkAction={handleBulkActionWithUser}
                />
              ))}
              {paginationData.paginatedExceptions.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No exceptions found that match your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ExceptionList);