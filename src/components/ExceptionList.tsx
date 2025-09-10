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
    <div className="h-full flex flex-col bg-background">


      {/* Filters Section */}
      <div className="px-4 py-3 border-b bg-background/30">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Filters</h3>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 text-xs"
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
            <Filter className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div className="lg:col-span-2">
            <p className="text-xs mb-1 text-muted-foreground font-medium">Book Code & Instrument ID</p>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Book code..."
                value={filters.ads_book_code}
                onChange={(e) => setFilters({ ...filters, ads_book_code: e.target.value })}
                className="h-7 text-xs"
              />
              <Select value={textFilterOperator} onValueChange={(value: "AND" | "OR") => setTextFilterOperator(value)}>
                <SelectTrigger className="h-7 w-[60px] flex-shrink-0 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OR">OR</SelectItem>
                  <SelectItem value="AND">AND</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Instrument ID..."
                value={(filters as any).instrument_id}
                onChange={(e) => setFilters({ ...filters, instrument_id: e.target.value })}
                className="h-7 text-xs"
              />
            </div>
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
                {uniqueSystems.map(system => (
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
                {uniqueLegalEntities.map(entity => (
                  <SelectItem key={entity} value={entity}>{entity}</SelectItem>
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
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Search and Count Bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b bg-background/30">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold">
            {filteredExceptions.length} exceptions
          </h2>
          {selectedExceptions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {selectedExceptions.length} selected
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs px-2"
                  onClick={() => onBulkAction("assign", selectedExceptions)}
                >
                  Assign
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs px-2"
                  onClick={() => onBulkAction("trigger-workflow", selectedExceptions)}
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
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            <Download className="h-3.5 w-3.5 mr-1" />
            Download
          </Button>
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
            <TableHeader className="sticky top-0 z-10 bg-background border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 bg-background">
                  <Checkbox
                    checked={
                      paginatedExceptions.length > 0 &&
                      selectedExceptions.length === paginatedExceptions.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer bg-background min-w-[120px]"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center text-xs font-semibold">
                    Exception ID
                    {sortField === "id" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer bg-background min-w-[100px]"
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
                  className="cursor-pointer bg-background min-w-[80px]"
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
                  className="cursor-pointer bg-background min-w-[100px]"
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
                  className="cursor-pointer bg-background min-w-[120px]"
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
                  className="cursor-pointer bg-background min-w-[140px]"
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
                  className="cursor-pointer bg-background min-w-[100px] text-right"
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
                  className="cursor-pointer bg-background min-w-[100px] text-right"
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
                  className="cursor-pointer bg-background min-w-[100px]"
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
                  className="cursor-pointer bg-background min-w-[80px] text-center"
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
                <TableHead className="w-16 bg-background text-center text-xs font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedExceptions.map((exception) => (
                <React.Fragment key={exception.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/30 border-b"
                    onClick={() => onExceptionSelect(exception)}
                  >
                    <TableCell
                      className="p-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedExceptions.includes(exception.id)}
                        onCheckedChange={(checked) =>
                          handleSelectException(exception.id, !!checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{exception.id}</TableCell>
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpand(exception.id);
                          }}
                        >
                          {expandedRows.includes(exception.id) ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <MoreHorizontal className="h-3 w-3" />
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
                                onBulkAction("trigger-workflow", [exception.id]);
                              }}
                            >
                              Start Workflow
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRows.includes(exception.id) && (
                    <TableRow>
                      <TableCell colSpan={12} className="bg-muted/20 p-4 border-b">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <h4 className="font-medium mb-2 text-xs text-muted-foreground uppercase tracking-wide">Business Information</h4>
                            <div className="space-y-1 text-xs">
                              <p><span className="font-medium">Book Code:</span> {exception.ads_book_code}</p>
                              <p><span className="font-medium">Book Path:</span> {exception.ads_book_path}</p>
                              <p><span className="font-medium">L04 Area:</span> {exception.l04_business_area_name}</p>
                              <p><span className="font-medium">L06 Category:</span> {exception.l06_name}</p>
                              <p><span className="font-medium">Assigned To:</span> {exception.assigned_to}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 text-xs text-muted-foreground uppercase tracking-wide">Instrument Details</h4>
                            <div className="space-y-1 text-xs">
                              <p><span className="font-medium">Instrument ID:</span> {exception.instrument_id}</p>
                              <p><span className="font-medium">Equity Class:</span> {exception.equity_class_path}</p>
                              <p><span className="font-medium">Classification:</span> {exception.position_tbbb_classification}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 text-xs text-muted-foreground uppercase tracking-wide">Position & Valuation</h4>
                            <div className="space-y-1 text-xs">
                              <p><span className="font-medium">Position AV:</span> {formatCurrency(exception.position_av)}</p>
                              <p><span className="font-medium">Position Qty:</span> {formatNumber(exception.position_qty)}</p>
                              <p><span className="font-medium">SOD Dealt BB:</span> {exception.sod_dealt_bb_underlying}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 text-xs text-muted-foreground uppercase tracking-wide">Exception Details</h4>
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

      {/* Pagination Footer */}
      <div className="border-t bg-background/50 px-4 py-3 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
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