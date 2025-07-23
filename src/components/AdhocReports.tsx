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
  Calendar,
  Search
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { loadAndTransformData } from "@/utils/dataTransform";
import { Exception } from "@/types/exception";

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

const AdhocReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState("exceptions");
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [filteredData, setFilteredData] = useState<Exception[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    try {
      const data = loadAndTransformData();
      setExceptions(data.exceptions);
      setFilteredData(data.exceptions);
    } catch (error) {
      console.error('Error loading data in AdhocReports:', error);
      setExceptions([]);
      setFilteredData([]);
    }
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, exceptions]);

  const applyFilters = () => {
    let filtered = [...exceptions];

    // Apply date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(exc => 
        new Date(exc.created_date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(exc => 
        new Date(exc.created_date) <= new Date(filters.dateTo)
      );
    }

    // Apply other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'dateFrom' && key !== 'dateTo') {
        filtered = filtered.filter(exc => {
          const excValue = exc[key as keyof Exception];
          return excValue && excValue.toString().toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    setFilteredData(filtered);
  };

  const handleFilterChange = (filterName: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearFilters = () => {
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
  };

  const downloadReport = (downloadAll: boolean = false) => {
    setIsLoading(true);
    
    const dataToDownload = downloadAll ? exceptions : filteredData;
    const reportName = selectedReport === "exceptions" ? "Exceptions Report" : 
                      selectedReport === "reassignment" ? "Reassignment Report" : "TPRT Report";
    
    // Create CSV content
    const headers = [
      "Exception ID",
      "L04 Business Area",
      "L06 Name",
      "Status",
      "Priority",
      "SLA Status",
      "System",
      "Legal Entity",
      "Regulator",
      "ADS Book Code",
      "Instrument ID",
      "Instrument Name",
      "Position AV",
      "TETB AV",
      "Position Qty",
      "TETB Qty",
      "Aging Days",
      "Created Date",
      "Reason"
    ];

    const csvContent = [
      headers.join(","),
      ...dataToDownload.map(exc => [
        exc.id,
        exc.l04_business_area_name || "",
        exc.l06_name || "",
        exc.status,
        exc.priority,
        exc.sla_status,
        exc.system || "",
        exc.legal_entity || "",
        exc.regulator || "",
        exc.ads_book_code || "",
        exc.instrument_id || "",
        exc.instrument_name || "",
        exc.position_av || "",
        exc.tetb_av || "",
        exc.position_qty || "",
        exc.tetb_qty || "",
        exc.aging_days,
        exc.created_date,
        exc.reason || ""
      ].map(field => `"${field}"`).join(","))
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

    setTimeout(() => setIsLoading(false), 1000);
  };

  const getUniqueValues = (field: keyof Exception) => {
    const values = exceptions
      .map(exc => exc[field])
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    return values as string[];
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
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Showing {filteredData.length} of {exceptions.length} records
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadReport(false)} disabled={isLoading}>
              <Download className="h-3 w-3 mr-1" />
              Download Filtered
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadReport(true)} disabled={isLoading}>
              <Download className="h-3 w-3 mr-1" />
              Download All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderExceptionsReport = () => (
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
                  <TableHead className="text-xs">Exception ID</TableHead>
                  <TableHead className="text-xs">L04 Business Area</TableHead>
                  <TableHead className="text-xs">L06 Name</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Priority</TableHead>
                  <TableHead className="text-xs">SLA Status</TableHead>
                  <TableHead className="text-xs">System</TableHead>
                  <TableHead className="text-xs">Legal Entity</TableHead>
                  <TableHead className="text-xs">Instrument ID</TableHead>
                  <TableHead className="text-xs">Position AV</TableHead>
                  <TableHead className="text-xs">TETB AV</TableHead>
                  <TableHead className="text-xs">Aging Days</TableHead>
                  <TableHead className="text-xs">Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((exception) => (
                  <TableRow key={exception.id}>
                    <TableCell className="text-xs font-mono">{exception.id}</TableCell>
                    <TableCell className="text-xs">{exception.l04_business_area_name}</TableCell>
                    <TableCell className="text-xs">{exception.l06_name}</TableCell>
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
                        {exception.status}
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
                        {exception.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge 
                        variant={exception.sla_status === 'SLA Breach' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {exception.sla_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{exception.system}</TableCell>
                    <TableCell className="text-xs">{exception.legal_entity}</TableCell>
                    <TableCell className="text-xs font-mono">{exception.instrument_id}</TableCell>
                    <TableCell className="text-xs">{exception.position_av}</TableCell>
                    <TableCell className="text-xs">{exception.tetb_av}</TableCell>
                    <TableCell className="text-xs">
                      <Badge 
                        variant={
                          exception.aging_days <= 7 ? 'secondary' :
                          exception.aging_days <= 14 ? 'outline' :
                          exception.aging_days <= 30 ? 'secondary' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {exception.aging_days}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(exception.created_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReassignmentReport = () => {
    // Generate reassignment data from exceptions
    const reassignmentData = exceptions.map(exc => ({
      id: exc.id,
      l04_business_area_name: exc.l04_business_area_name,
      l06_name: exc.l06_name,
      status: exc.status,
      priority: exc.priority,
      previousAssignee: 'System Auto',
      currentAssignee: exc.assigned_to,
      reassignmentDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      reassignmentReason: Math.random() > 0.5 ? 'Workload Balancing' : 'Expertise Required',
      aging_days: exc.aging_days,
      created_date: exc.created_date
    }));

    const downloadReassignmentReport = (downloadAll: boolean = false) => {
      setIsLoading(true);
      
      const dataToDownload = downloadAll ? reassignmentData : reassignmentData.filter(item => 
        filteredData.some(exc => exc.id === item.id)
      );
      
      // Create CSV content
      const headers = [
        "Exception ID",
        "L04 Business Area",
        "L06 Name",
        "Status",
        "Priority",
        "Previous Assignee",
        "Current Assignee",
        "Reassignment Date",
        "Reassignment Reason",
        "Aging Days",
        "Created Date"
      ];

      const csvContent = [
        headers.join(","),
        ...dataToDownload.map(item => [
          item.id,
          item.l04_business_area_name || "",
          item.l06_name || "",
          item.status,
          item.priority,
          item.previousAssignee,
          item.currentAssignee,
          new Date(item.reassignmentDate).toLocaleDateString(),
          item.reassignmentReason,
          item.aging_days,
          new Date(item.created_date).toLocaleDateString()
        ].map(field => `"${field}"`).join(","))
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `Reassignment_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setIsLoading(false), 1000);
    };

    return (
      <div className="space-y-2">
        <Card className="mb-2">
          <CardHeader className="pb-2 pt-2 px-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Reassignment Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
            </div>

            <div className="flex justify-between items-center mt-3 pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                Showing {filteredData.length} reassignment records
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadReassignmentReport(false)} disabled={isLoading}>
                  <Download className="h-3 w-3 mr-1" />
                  Download Filtered
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadReassignmentReport(true)} disabled={isLoading}>
                  <Download className="h-3 w-3 mr-1" />
                  Download All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 pt-2 px-2">
            <CardTitle className="text-sm">Reassignment History</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Exception ID</TableHead>
                    <TableHead className="text-xs">L04 Business Area</TableHead>
                    <TableHead className="text-xs">L06 Name</TableHead>
                    <TableHead className="text-xs">Priority</TableHead>
                    <TableHead className="text-xs">Previous Assignee</TableHead>
                    <TableHead className="text-xs">Current Assignee</TableHead>
                    <TableHead className="text-xs">Reassignment Date</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs">Aging Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reassignmentData
                    .filter(item => filteredData.some(exc => exc.id === item.id))
                    .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-mono">{item.id}</TableCell>
                      <TableCell className="text-xs">{item.l04_business_area_name}</TableCell>
                      <TableCell className="text-xs">{item.l06_name}</TableCell>
                      <TableCell className="text-xs">
                        <Badge 
                          variant={
                            item.priority === 'Critical' ? 'destructive' :
                            item.priority === 'High' ? 'destructive' :
                            item.priority === 'Medium' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{item.previousAssignee}</TableCell>
                      <TableCell className="text-xs">{item.currentAssignee}</TableCell>
                      <TableCell className="text-xs">{new Date(item.reassignmentDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs">{item.reassignmentReason}</TableCell>
                      <TableCell className="text-xs">
                        <Badge 
                          variant={
                            item.aging_days <= 7 ? 'secondary' :
                            item.aging_days <= 14 ? 'outline' :
                            item.aging_days <= 30 ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {item.aging_days}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPlaceholderReport = (reportType: string) => (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">TPRT Report</h3>
            <p className="text-sm text-muted-foreground mt-2">
              This report will show TPRT (Third Party Risk Tracking) data and metrics.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Report functionality coming soon...
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
              {renderExceptionsReport()}
            </TabsContent>

            <TabsContent value="reassignment" className="mt-4">
              {renderReassignmentReport()}
            </TabsContent>

            <TabsContent value="tprt" className="mt-4">
              {renderPlaceholderReport("tprt")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdhocReports;