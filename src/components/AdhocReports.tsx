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
import { 
  Download, 
  Filter, 
  RefreshCw, 
  FileText, 
  Users, 
  BarChart3,
  Settings,
  Eye,
  EyeOff
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

const AdhocReports: React.FC = () => {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState("exceptions");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [businessAreaFilter, setBusinessAreaFilter] = useState("");
  const [l06Filter, setL06Filter] = useState("");
  const [systemFilter, setSystemFilter] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

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

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    l04_business_area_name: true,
    l06_name: true,
    named_no_name: false,
    ads_book_code: false,
    ads_book_path: false,
    system: true,
    legal_entity: false,
    regulator: false,
    instrument_id: true,
    equity_class_path: false,
    instrument_type: true,
    instrument_name: true,
    position_tbbb_classification: false,
    as_of_time: false,
    bb_underlying: false,
    reason: true,
    look_through: false,
    sod_dealt_bb_underlying: false,
    position_av: true,
    tetb_av: true,
    position_qty: false,
    tetb_qty: false,
    tetb_match: false,
    status: true,
    priority: true,
    assigned_to: true,
    created_date: true,
    due_date: true,
    sla_status: true,
    aging_days: true
  });

  // Column definitions with friendly names
  const columnDefinitions = {
    id: 'Exception ID',
    l04_business_area_name: 'Business Area',
    l06_name: 'L06 Name',
    named_no_name: 'Named/No Name',
    ads_book_code: 'ADS Book Code',
    ads_book_path: 'ADS Book Path',
    system: 'System',
    legal_entity: 'Legal Entity',
    regulator: 'Regulator',
    instrument_id: 'Instrument ID',
    equity_class_path: 'Equity Class Path',
    instrument_type: 'Instrument Type',
    instrument_name: 'Instrument Name',
    position_tbbb_classification: 'Position TBBB Classification',
    as_of_time: 'As Of Time',
    bb_underlying: 'BB Underlying',
    reason: 'Reason',
    look_through: 'Look Through',
    sod_dealt_bb_underlying: 'SOD Dealt BB Underlying',
    position_av: 'Position AV',
    tetb_av: 'TETB AV',
    position_qty: 'Position Qty',
    tetb_qty: 'TETB Qty',
    tetb_match: 'TETB Match',
    status: 'Status',
    priority: 'Priority',
    assigned_to: 'Assigned To',
    created_date: 'Created Date',
    due_date: 'Due Date',
    sla_status: 'SLA Status',
    aging_days: 'Aging Days'
  };

  const filteredData = useMemo(() => {
    if (isLoading || !exceptions.length) {
      return [];
    }
    let filtered = [...exceptions];

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (priorityFilter && priorityFilter !== "all") {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(term)
        )
      );
    }

    if (businessAreaFilter) {
      filtered = filtered.filter(item => 
        item.l04_business_area_name.toLowerCase().includes(businessAreaFilter.toLowerCase())
      );
    }

    if (l06Filter) {
      filtered = filtered.filter(item => 
        item.l06_name.toLowerCase().includes(l06Filter.toLowerCase())
      );
    }

    if (systemFilter) {
      filtered = filtered.filter(item => 
        item.system.toLowerCase().includes(systemFilter.toLowerCase())
      );
    }

    if (assignedToFilter) {
      filtered = filtered.filter(item => 
        item.assigned_to.toLowerCase().includes(assignedToFilter.toLowerCase())
      );
    }

    if (dateFromFilter) {
      filtered = filtered.filter(item => 
        new Date(item.created_date) >= new Date(dateFromFilter)
      );
    }

    if (dateToFilter) {
      filtered = filtered.filter(item => 
        new Date(item.created_date) <= new Date(dateToFilter)
      );
    }

    return filtered;
  }, [exceptions, isLoading, statusFilter, priorityFilter, searchTerm, businessAreaFilter, l06Filter, systemFilter, assignedToFilter, dateFromFilter, dateToFilter]);

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

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSearchTerm("");
    setBusinessAreaFilter("");
    setL06Filter("");
    setSystemFilter("");
    setAssignedToFilter("");
    setDateFromFilter("");
    setDateToFilter("");
  };

  const resetColumnSelection = () => {
    setVisibleColumns({
      id: true,
      l04_business_area_name: true,
      l06_name: true,
      named_no_name: false,
      ads_book_code: false,
      ads_book_path: false,
      system: true,
      legal_entity: false,
      regulator: false,
      instrument_id: true,
      equity_class_path: false,
      instrument_type: true,
      instrument_name: true,
      position_tbbb_classification: false,
      as_of_time: false,
      bb_underlying: false,
      reason: true,
      look_through: false,
      sod_dealt_bb_underlying: false,
      position_av: true,
      tetb_av: true,
      position_qty: false,
      tetb_qty: false,
      tetb_match: false,
      status: true,
      priority: true,
      assigned_to: true,
      created_date: true,
      due_date: true,
      sla_status: true,
      aging_days: true
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
              <Button onClick={downloadCSV} size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export ({filteredData.length})
              </Button>
            </div>
          </div>

          {/* Compact Filter Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            <div>
              <Input
                placeholder="Search all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Unwind">Unwind</SelectItem>
                  <SelectItem value="Centralise">Centralise</SelectItem>
                  <SelectItem value="Writedown">Writedown</SelectItem>
                  <SelectItem value="Insufficient Data">Insufficient Data</SelectItem>
                  <SelectItem value="Challenge">Challenge</SelectItem>
                  <SelectItem value="Reassignment">Reassignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                placeholder="Business area..."
                value={businessAreaFilter}
                onChange={(e) => setBusinessAreaFilter(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Input
                placeholder="L06 name..."
                value={l06Filter}
                onChange={(e) => setL06Filter(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Input
                placeholder="System..."
                value={systemFilter}
                onChange={(e) => setSystemFilter(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Input
                placeholder="Assigned to..."
                value={assignedToFilter}
                onChange={(e) => setAssignedToFilter(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="Date from"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="h-8 text-xs"
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
            {dateToFilter && (
              <div>
                <Input
                  type="date"
                  placeholder="Date to"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="h-6 w-32 text-xs"
                />
              </div>
            )}
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

  const renderTPRTReport = () => (
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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ad-hoc Reports</h1>
            <p className="text-muted-foreground">Generate and export custom reports</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

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

            <TabsContent value="reassignment" className="h-full m-0 p-6">
              {renderReassignmentReport()}
            </TabsContent>

            <TabsContent value="tprt" className="h-full m-0 p-6">
              {renderTPRTReport()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdhocReports;