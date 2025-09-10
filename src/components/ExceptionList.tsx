import React, { useState, useEffect } from "react";
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

interface ExceptionListProps {
  exceptions: Exception[];
  isLoading: boolean;
  onExceptionSelect?: (exception: Exception) => void;
  onBulkAction?: (action: string, exceptionIds: string[]) => void;
  filters?: ExceptionFilters;
  workflowStatus?: Record<string, string>;
}

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
}) => {
  const [selectedExceptions, setSelectedExceptions] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Exception>("created_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(propFilters);
  const [textFilterOperator, setTextFilterOperator] = useState<"AND" | "OR">("OR");
  const [classificationFilter, setClassificationFilter] = useState<string>("all");

  const itemsPerPage = 15;

  useEffect(() => {
    setFilters(propFilters);
  }, [propFilters]);

  const handleSort = (field: keyof Exception) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExceptions(
        paginatedExceptions.map((exception) => exception.id),
      );
    } else {
      setSelectedExceptions([]);
    }
  };

  const handleSelectException = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedExceptions([...selectedExceptions, id]);
    } else {
      setSelectedExceptions(
        selectedExceptions.filter((exceptionId) => exceptionId !== id),
      );
    }
  };

  const toggleRowExpand = (id: string) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter((rowId) => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  // Apply search and filters to exceptions
  const filteredExceptions = [...exceptions].filter((exception) => {
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
        exception.reason
      ].filter(Boolean);
      
      const matchesSearch = searchableFields.some(field => 
        field?.toString().toLowerCase().includes(searchLower)
      );
      
      if (!matchesSearch) return false;
    }

    // Apply text filters (book code, instrument id)
    const bookCodeFilter = filters.ads_book_code?.trim().toLowerCase();
    const instrumentIdFilter = (filters as any).instrument_id?.trim().toLowerCase();
    
    if (bookCodeFilter || instrumentIdFilter) {
      const bookCodeMatch = bookCodeFilter && exception.ads_book_code?.toLowerCase().includes(bookCodeFilter);
      const instrumentIdMatch = instrumentIdFilter && exception.instrument_id?.toLowerCase().includes(instrumentIdFilter);

      if (textFilterOperator === "AND") {
        if ((bookCodeFilter && !bookCodeMatch) || (instrumentIdFilter && !instrumentIdMatch)) {
          return false;
        }
      } else { // OR logic
        if (bookCodeFilter && instrumentIdFilter) {
          if (!bookCodeMatch && !instrumentIdMatch) return false;
        } else if (bookCodeFilter && !bookCodeMatch) {
          return false;
        } else if (instrumentIdFilter && !instrumentIdMatch) {
          return false;
        }
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
  const sortedExceptions = [...filteredExceptions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === undefined || bValue === undefined) {
      return 0;
    }
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filteredExceptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExceptions = sortedExceptions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

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
      case "Unwind":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 ocean:bg-blue-200/70 ocean:text-blue-900 modern:bg-blue-900/40 modern:text-blue-400";
      case "Centralise":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 ocean:bg-purple-200/70 ocean:text-purple-900 modern:bg-purple-900/40 modern:text-purple-400";
      case "Writedown":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 ocean:bg-orange-200/70 ocean:text-orange-900 modern:bg-orange-900/40 modern:text-orange-400";
      case "Insufficient Data":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 ocean:bg-yellow-200/70 ocean:text-yellow-900 modern:bg-yellow-900/40 modern:text-yellow-400";
      case "Challenge":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ocean:bg-red-200/70 ocean:text-red-900 modern:bg-red-900/40 modern:text-red-400";
      case "Reassignment":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300 ocean:bg-gray-200/70 ocean:text-gray-900 modern:bg-gray-700/40 modern:text-gray-400";
      default:
        return "";
    }
  };

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

  // Get unique values for filter dropdowns - filter out empty/null/undefined values
  const uniqueSystems = Array.from(new Set(exceptions.map(e => e.system).filter(Boolean)));
  const uniqueLegalEntities = Array.from(new Set(exceptions.map(e => e.legal_entity).filter(Boolean)));
  const uniqueRegulators = Array.from(new Set(exceptions.map(e => e.regulator).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(exceptions.map(e => e.status).filter(Boolean)));

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
    <div className="bg-card rounded-lg border w-full">
      {/* Classification Tabs */}
      <div className="mb-3 px-3 pt-3">
        <Tabs value={classificationFilter} onValueChange={setClassificationFilter}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="BankingBook">BankingBook</TabsTrigger>
            <TabsTrigger value="Uncertain">Uncertain</TabsTrigger>
            <TabsTrigger value="CentraliseAndWritedown">CentraliseAndWritedown</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters Section */}
      <Card className="mb-3">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Filters</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
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
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div className="lg:col-span-2">
              <p className="text-xs mb-1 text-muted-foreground">Book Code & Instrument ID</p>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Filter by book code..."
                  value={filters.ads_book_code}
                  onChange={(e) => setFilters({ ...filters, ads_book_code: e.target.value })}
                  className="h-8"
                />
                <Select value={textFilterOperator} onValueChange={(value: "AND" | "OR") => setTextFilterOperator(value)}>
                  <SelectTrigger className="h-8 w-[80px] flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OR">OR</SelectItem>
                    <SelectItem value="AND">AND</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Filter by instrument ID..."
                  value={(filters as any).instrument_id}
                  onChange={(e) => setFilters({ ...filters, instrument_id: e.target.value })}
                  className="h-8"
                />
              </div>
            </div>
            
            <div>
              <p className="text-xs mb-1 text-muted-foreground">System</p>
              <Select
                value={filters.system || "all"}
                onValueChange={(value) => setFilters({...filters, system: value === "all" ? "" : value})}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Systems</SelectItem>
                  {uniqueSystems.map(system => (
                    <SelectItem key={system} value={system}>{system}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs mb-1 text-muted-foreground">Legal Entity</p>
              <Select
                value={filters.legal_entity || "all"}
                onValueChange={(value) => setFilters({...filters, legal_entity: value === "all" ? "" : value})}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {uniqueLegalEntities.map(entity => (
                    <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs mb-1 text-muted-foreground">Regulator</p>
              <Select
                value={filters.regulator || "all"}
                onValueChange={(value) => setFilters({...filters, regulator: value === "all" ? "" : value})}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select regulator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regulators</SelectItem>
                  {uniqueRegulators.map(regulator => (
                    <SelectItem key={regulator} value={regulator}>{regulator}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs mb-1 text-muted-foreground">Status</p>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => setFilters({...filters, status: value === "all" ? "" : value})}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-3 px-3">
        <h2 className="text-lg font-semibold">
          Exceptions ({filteredExceptions.length})
        </h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search exceptions..." 
              className="pl-8 w-64 h-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selectedExceptions.length > 0 && (
        <div className="bg-muted/50 p-2 rounded-md mb-3 mx-3 flex justify-between items-center">
          <span className="text-sm font-medium">
            {selectedExceptions.length} exceptions selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction("assign", selectedExceptions)}
            >
              Assign
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction("update-status", selectedExceptions)}
            >
              Update Status
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onBulkAction("trigger-workflow", selectedExceptions)
              }
            >
              Trigger Workflow
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedExceptions([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="w-full whitespace-nowrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card z-20 w-10">
                <Checkbox
                  checked={
                    paginatedExceptions.length > 0 &&
                    selectedExceptions.length === paginatedExceptions.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead
                className="sticky left-10 bg-card z-20 cursor-pointer"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center">
                  Exception ID
                  {sortField === "id" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("ads_book_code")}
              >
                <div className="flex items-center">
                  SDS Book Code
                  {sortField === "ads_book_code" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("system")}
              >
                <div className="flex items-center">
                  System
                  {sortField === "system" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("legal_entity")}
              >
                <div className="flex items-center">
                  Legal Entity
                  {sortField === "legal_entity" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("instrument_id")}
              >
                <div className="flex items-center">
                  Instrument ID
                  {sortField === "instrument_id" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("position_tbbb_classification")}
              >
                <div className="flex items-center">
                  Position TBBB Class
                  {sortField === "position_tbbb_classification" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("position_qty")}
              >
                <div className="flex items-center">
                  Position Qty
                  {sortField === "position_qty" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("tetb_qty")}
              >
                <div className="flex items-center">
                  Original Qty
                  {sortField === "tetb_qty" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  {sortField === "status" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("aging_days")}
              >
                <div className="flex items-center">
                  Aging
                  {sortField === "aging_days" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="w-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedExceptions.map((exception) => (
              <React.Fragment key={exception.id}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onExceptionSelect(exception)}
                >
                  <TableCell
                    className="sticky left-0 bg-card z-10 p-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={selectedExceptions.includes(exception.id)}
                      onCheckedChange={(checked) =>
                        handleSelectException(exception.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="sticky left-10 bg-card z-10 font-mono text-sm">{exception.id}</TableCell>
                  <TableCell>{exception.ads_book_code}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {exception.system}
                    </Badge>
                  </TableCell>
                  <TableCell>{exception.legal_entity}</TableCell>
                  <TableCell className="font-mono text-sm">{exception.instrument_id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {exception.position_tbbb_classification}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(exception.position_qty)}</TableCell>
                  <TableCell className="text-right">{formatNumber(exception.tetb_qty)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(exception.status)}>
                      {exception.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{exception.aging_days}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRowExpand(exception.id);
                        }}
                      >
                        {expandedRows.includes(exception.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onExceptionSelect(exception);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onBulkAction("assign", [exception.id]);
                            }}
                          >
                            Assign
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onBulkAction("update-status", [exception.id]);
                            }}
                          >
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onBulkAction("trigger-workflow", [exception.id]);
                            }}
                          >
                            Start Exception Workflow
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>

                </TableRow>
                {expandedRows.includes(exception.id) && (
                  <TableRow>
                    <TableCell colSpan={12} className="bg-muted/30 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 text-sm">Business Information</h4>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-medium">Book Code:</span> {exception.ads_book_code}</p>
                            <p><span className="font-medium">Book Path:</span> {exception.ads_book_path}</p>
                            <p><span className="font-medium">L04 Area:</span> {exception.l04_business_area_name}</p>
                            <p><span className="font-medium">L06 Category:</span> {exception.l06_name}</p>
                            <p><span className="font-medium">Assigned To:</span> {exception.assigned_to}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-sm">Instrument Details</h4>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-medium">Instrument ID:</span> {exception.instrument_id}</p>
                            <p><span className="font-medium">Equity Class:</span> {exception.equity_class_path}</p>
                            <p><span className="font-medium">Classification:</span> {exception.position_tbbb_classification}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-sm">Position & Valuation</h4>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-medium">Position AV:</span> {formatCurrency(exception.position_av)}</p>
                            <p><span className="font-medium">Position Qty:</span> {formatNumber(exception.position_qty)}</p>
                            <p><span className="font-medium">SOD Dealt BB:</span> {exception.sod_dealt_bb_underlying}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-sm">Exception Details</h4>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-medium">Look Through:</span> {exception.look_through}</p>
                            <p><span className="font-medium">As of Time:</span> {new Date(exception.as_of_time).toLocaleString()}</p>
                            <p><span className="font-medium">Created Date:</span> {new Date(exception.created_date).toLocaleDateString()}</p>
                            <p><span className="font-medium">Due Date:</span> {new Date(exception.due_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
            {paginatedExceptions.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">
                  No exceptions found that match your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="mt-4 flex justify-between items-center px-3">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to{" "}
          {Math.min(startIndex + itemsPerPage, filteredExceptions.length)} of{" "}
          {filteredExceptions.length} exceptions
        </div>
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
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={pageNum === currentPage}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default ExceptionList;