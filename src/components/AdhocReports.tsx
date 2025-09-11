import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Download, 
  Filter, 
  RefreshCw, 
  FileText, 
  Users, 
  BarChart3,
  Settings,
  Eye,
  EyeOff,
  CalendarIcon
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { fetchAndTransformExceptions } from "@/utils/apiDataTransform";
import { Exception } from "@/types/exception";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

const AdhocReports: React.FC = () => {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState("exceptions");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Similar filters from dashboard
  const [filters, setFilters] = useState({
    ads_book_code: "",
    instrument_id: "",
    system: "",
    legal_entity: "",
    regulator: "",
    status: "",
  });
  
  // Date range filter
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // Classification filter (Position TBBB Classification)
  const [classificationFilter, setClassificationFilter] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAndTransformExceptions();
        setExceptions(data);
      } catch (error) {
        console.error("Failed to load exception data for reports:", error);
        setExceptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Column visibility state - Only fields from the provided array structure
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    status: true,
    aging_days: true,
    created_date: true,
    ads_book_code: true,
    ads_book_path: false,
    system: true,
    legal_entity: true,
    regulator: true,
    instrument_id: true,
    equity_class_path: true,
    instrument_type: true,
    instrument_name: true,
    position_tbbb_classification: true,
    as_of_time: false,
    bb_underlying: false,
    sod_dealt_bb_underlying: false,
    position_av: true,
    position_qty: true,
    look_through: false,
    tetb_qty: true,
    categoryId: false,
    id: true
  });

  // Column definitions with friendly names - Only fields from the provided array structure
  const columnDefinitions = {
    status: 'Status',
    aging_days: 'Aging',
    created_date: 'Processed Exceptions',
    ads_book_code: 'SDS Book Code',
    ads_book_path: 'SDS Book Path',
    system: 'System',
    legal_entity: 'Legal Entity',
    regulator: 'Regulator',
    instrument_id: 'Instrument ID',
    equity_class_path: 'Equity Class Type',
    instrument_type: 'Instrument Type',
    instrument_name: 'Instrument Name',
    position_tbbb_classification: 'Position TBBB Classification',
    as_of_time: 'As Of Time',
    bb_underlying: 'BB Underlyings',
    sod_dealt_bb_underlying: 'SOD Delta on BB Underlying',
    position_av: 'Position AV',
    position_qty: 'Position Qty',
    look_through: 'Look Through',
    tetb_qty: 'Original Qty',
    categoryId: 'Category ID',
    id: 'Exception ID'
  };

  // Memoized unique values for dropdowns
  const uniqueValues = useMemo(() => ({
    systems: Array.from(new Set(exceptions.map(e => e.system).filter(Boolean))),
    legalEntities: Array.from(new Set(exceptions.map(e => e.legal_entity).filter(Boolean))),
    regulators: Array.from(new Set(exceptions.map(e => e.regulator).filter(Boolean))),
    statuses: Array.from(new Set(exceptions.map(e => e.status).filter(Boolean))),
  }), [exceptions]);

  const filteredData = useMemo(() => {
    if (isLoading || !exceptions.length) {
      return [];
    }
    let filtered = [...exceptions];

    // Search functionality
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchableFields = [
        'id',
        'instrument_id',
        'ads_book_code',
        'instrument_name',
        'system',
        'legal_entity',
        'regulator',
        'status',
        'categoryName'
      ];
      
      filtered = filtered.filter(item => 
        searchableFields.some(field => 
          item[field as keyof Exception]?.toString().toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply text filters with && and || support
    const bookCodeFilter = filters.ads_book_code?.trim();
    const instrumentIdFilter = filters.instrument_id?.trim();
    
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
      
      if (bookCodeFilter) {
        filtered = filtered.filter(item => evaluateFilter(bookCodeFilter, item.ads_book_code || ''));
      }
      if (instrumentIdFilter) {
        filtered = filtered.filter(item => evaluateFilter(instrumentIdFilter, item.instrument_id || ''));
      }
    }

    // Apply classification filter
    if (classificationFilter && classificationFilter !== "all") {
      filtered = filtered.filter(item => item.position_tbbb_classification === classificationFilter);
    }

    // Apply dropdown filters
    if (filters.system && filters.system !== "all") {
      filtered = filtered.filter(item => item.system === filters.system);
    }
    if (filters.legal_entity && filters.legal_entity !== "all") {
      filtered = filtered.filter(item => item.legal_entity === filters.legal_entity);
    }
    if (filters.regulator && filters.regulator !== "all") {
      filtered = filtered.filter(item => item.regulator === filters.regulator);
    }
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // Apply date range filter
    if (dateRange?.from) {
      filtered = filtered.filter(item => 
        new Date(item.created_date) >= dateRange.from!
      );
    }
    if (dateRange?.to) {
      filtered = filtered.filter(item => 
        new Date(item.created_date) <= dateRange.to!
      );
    }

    return filtered;
  }, [exceptions, isLoading, searchTerm, filters, classificationFilter, dateRange]);

  const visibleColumnKeys = useMemo(() => {
    return Object.keys(visibleColumns).filter(key => visibleColumns[key]);
  }, [visibleColumns]);

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const downloadCSV = () => {
    if (filteredData.length === 0 || isLoading) return;
    
    // Only include visible columns in the export
    const visibleKeys = visibleColumnKeys;
    const headers = visibleKeys.map(key => columnDefinitions[key as keyof typeof columnDefinitions]).join(',');
    
    const csvContent = [
      headers,
      ...filteredData.map(item => 
        visibleKeys.map(key => {
          const value = item[key as keyof Exception];
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAndTransformExceptions();
      setExceptions(data);
    } catch (error) {
      console.error("Failed to refresh exception data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setClassificationFilter("all");
    setFilters({
      ads_book_code: "",
      instrument_id: "",
      system: "",
      legal_entity: "",
      regulator: "",
      status: "",
    });
    setDateRange(undefined);
  };

  const resetColumnSelection = () => {
    setVisibleColumns({
      status: true,
      aging_days: true,
      created_date: true,
      ads_book_code: true,
      ads_book_path: false,
      system: true,
      legal_entity: true,
      regulator: true,
      instrument_id: true,
      equity_class_path: true,
      instrument_type: true,
      instrument_name: true,
      position_tbbb_classification: true,
      as_of_time: false,
      bb_underlying: false,
      sod_dealt_bb_underlying: false,
      position_av: true,
      position_qty: true,
      look_through: false,
      tetb_qty: true,
      categoryId: false,
      id: true
    });
  };

  const selectAllColumns = () => {
    const allSelected = Object.keys(columnDefinitions).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setVisibleColumns(allSelected);
  };

  const renderExceptionsReport = () => (
    <div className="h-full flex flex-col">
      {/* Filters Section - Collapsible */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-muted/30">
        <div className="space-y-4">
          {/* Filter Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <h3 className="font-medium">Filters & Search</h3>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Columns ({visibleColumnKeys.length})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Select Columns</h4>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={selectAllColumns}>
                          <Eye className="h-3 w-3 mr-1" />
                          All
                        </Button>
                        <Button variant="ghost" size="sm" onClick={resetColumnSelection}>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {Object.entries(columnDefinitions).map(([key, label]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={key}
                              checked={visibleColumns[key]}
                              onCheckedChange={() => handleColumnToggle(key)}
                            />
                            <Label htmlFor={key} className="text-sm font-normal cursor-pointer">
                              {label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button variant="outline" size="sm" onClick={refreshData} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={downloadCSV} size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export ({filteredData.length})
              </Button>
            </div>
          </div>

          {/* Position TBBB Classification Tabs */}
          <div className="flex items-center gap-4 mb-4">
            <Tabs value={classificationFilter} onValueChange={setClassificationFilter} className="w-auto">
              <TabsList className="h-8 bg-muted/50">
                <TabsTrigger value="all" className="text-xs px-3 data-[state=active]:bg-background">All</TabsTrigger>
                <TabsTrigger value="BankingBook" className="text-xs px-3 data-[state=active]:bg-background">BankingBook</TabsTrigger>
                <TabsTrigger value="Uncertain" className="text-xs px-3 data-[state=active]:bg-background">Uncertain</TabsTrigger>
                <TabsTrigger value="CentraliseAndWritedown" className="text-xs px-3 data-[state=active]:bg-background">CentraliseAndWritedown</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 items-end mb-4">
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
                value={filters.instrument_id}
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

          {/* Date Range Filter */}
          <div className="flex items-center gap-4 mb-4">
            <div>
              <p className="text-xs mb-1 text-muted-foreground font-medium">Date Range</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal h-7 text-xs",
                      !dateRange && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <p className="text-xs mb-1 text-muted-foreground font-medium">Search</p>
              <Input
                placeholder="Search all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-7 text-xs w-64"
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>
              {isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                `Showing ${filteredData.length} of ${exceptions.length} records`
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Grid Section */}
      <div className="flex-1 overflow-hidden px-6 py-4">
        <div className="h-full border rounded-lg bg-background shadow-sm">
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
                <TableRow>
                  {visibleColumnKeys.map((key) => (
                    <TableHead 
                      key={key} 
                      className="whitespace-nowrap px-3 py-2 text-xs font-medium border-r last:border-r-0 bg-muted/50"
                    >
                      {columnDefinitions[key as keyof typeof columnDefinitions]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 15 }).map((_, i) => (
                    <TableRow key={i}>
                      {visibleColumnKeys.map((key) => (
                        <TableCell key={key} className="whitespace-nowrap px-3 py-2 border-r last:border-r-0">
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumnKeys.length} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Filter className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No data matches the current filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow 
                      key={item.id} 
                      className={`hover:bg-muted/50 ${index % 2 === 0 ? 'bg-muted/20' : ''}`}
                    >
                      {visibleColumnKeys.map((key) => (
                        <TableCell key={key} className="whitespace-nowrap px-3 py-2 text-xs border-r last:border-r-0">
                          {key === 'status' || key === 'priority' ? (
                            <Badge 
                              variant={
                                (item[key as keyof Exception] === 'Challenge' || 
                                 item[key as keyof Exception] === 'Insufficient Data' || 
                                 item[key as keyof Exception] === 'Critical' || 
                                 item[key as keyof Exception] === 'High')
                                  ? 'destructive' 
                                  : 'secondary'
                              }
                              className="text-xs px-1.5 py-0.5"
                            >
                              {String(item[key as keyof Exception])}
                            </Badge>
                          ) : key === 'tetb_match' ? (
                            <span className={item[key as keyof Exception] ? 'text-green-600' : 'text-red-600'}>
                              {item[key as keyof Exception] ? 'Yes' : 'No'}
                            </span>
                          ) : key === 'position_av' || key === 'tetb_av' ? (
                            <span className="font-mono">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(Number(item[key as keyof Exception]) || 0)}
                            </span>
                          ) : key === 'created_date' || key === 'due_date' ? (
                            <span className="text-muted-foreground">
                              {item[key as keyof Exception] ? new Date(item[key as keyof Exception] as string).toLocaleDateString() : ''}
                            </span>
                          ) : (
                            <span className="truncate max-w-[200px] block" title={String(item[key as keyof Exception] || '')}>
                              {String(item[key as keyof Exception] || '')}
                            </span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReassignmentReport = () => (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-6 py-4 border-b bg-muted/30">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTPRTReport = () => (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-6 py-4 border-b bg-muted/30">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={selectedReport} onValueChange={setSelectedReport} defaultValue="exceptions" className="h-full flex flex-col">
          <div className="flex-shrink-0 px-6 py-4 border-b">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="exceptions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Exceptions
              </TabsTrigger>
              <TabsTrigger value="reassignment" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Reassignment
              </TabsTrigger>
              <TabsTrigger value="tprt" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                TPRT
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="exceptions" className="h-full m-0 p-0">
              {renderExceptionsReport()}
            </TabsContent>

            <TabsContent value="reassignment" className="h-full m-0 p-0">
              {renderReassignmentReport()}
            </TabsContent>

            <TabsContent value="tprt" className="h-full m-0 p-0">
              {renderTPRTReport()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdhocReports;