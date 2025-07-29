import React, { useState, useMemo } from "react";
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
  BarChart3
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Types
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

// Sample data
const SAMPLE_DATA: Exception[] = [
  {
    id: "EXC-2024-001",
    l04_business_area_name: "Fixed Income Trading",
    l06_name: "Government Bonds",
    named_no_name: "US Treasury 10Y",
    ads_book_code: "FI-GOV-001",
    ads_book_path: "/Trading/FixedIncome/Government/US",
    system: "Murex",
    legal_entity: "Goldman Sachs International",
    regulator: "FCA",
    instrument_id: "US912828XG55",
    equity_class_path: "/Bonds/Government/US/10Y",
    instrument_type: "Government Bond",
    instrument_name: "US Treasury Note 2.875% 15-May-2032",
    position_tbbb_classification: "Level 1",
    as_of_time: "2024-06-02T09:00:00Z",
    bb_underlying: "US10Y",
    reason: "Position mismatch between systems",
    look_through: "Direct",
    sod_dealt_bb_underlying: "US10Y",
    position_av: 15750000.50,
    tetb_av: 15850000.75,
    position_qty: 15000000,
    tetb_qty: 15100000,
    tetb_match: false,
    status: "Challenge",
    priority: "High",
    sla_status: "Within SLA",
    assigned_to: "John Smith",
    created_date: "2024-06-01T14:30:00Z",
    due_date: "2024-06-03T17:00:00Z",
    aging_days: 1
  },
  {
    id: "EXC-2024-002",
    l04_business_area_name: "Equity Trading",
    l06_name: "Large Cap Stocks",
    named_no_name: "Apple Inc",
    ads_book_code: "EQ-LC-002",
    ads_book_path: "/Trading/Equity/LargeCap/US",
    system: "Bloomberg AIM",
    legal_entity: "Goldman Sachs & Co LLC",
    regulator: "SEC",
    instrument_id: "AAPL",
    equity_class_path: "/Equity/US/Technology/AAPL",
    instrument_type: "Common Stock",
    instrument_name: "Apple Inc Common Stock",
    position_tbbb_classification: "Level 1",
    as_of_time: "2024-06-02T09:00:00Z",
    bb_underlying: "AAPL US",
    reason: "Quantity discrepancy in overnight processing",
    look_through: "Direct",
    sod_dealt_bb_underlying: "AAPL US",
    position_av: 18500000.00,
    tetb_av: 18500000.00,
    position_qty: 100000,
    tetb_qty: 98500,
    tetb_match: false,
    status: "Reassignment",
    priority: "Medium",
    sla_status: "Within SLA",
    assigned_to: "Sarah Johnson",
    created_date: "2024-06-01T16:45:00Z",
    due_date: "2024-06-04T17:00:00Z",
    aging_days: 1
  },
  {
    id: "EXC-2024-003",
    l04_business_area_name: "Derivatives Trading",
    l06_name: "Interest Rate Swaps",
    named_no_name: "USD 5Y IRS",
    ads_book_code: "DER-IRS-003",
    ads_book_path: "/Trading/Derivatives/IRS/USD",
    system: "Calypso",
    legal_entity: "Goldman Sachs International",
    regulator: "CFTC",
    instrument_id: "USD5Y_IRS_001",
    equity_class_path: "/Derivatives/IRS/USD/5Y",
    instrument_type: "Interest Rate Swap",
    instrument_name: "USD 5Y Interest Rate Swap",
    position_tbbb_classification: "Level 2",
    as_of_time: "2024-06-02T09:00:00Z",
    bb_underlying: "USSW5 Curncy",
    reason: "Mark-to-market valuation difference",
    look_through: "Underlying",
    sod_dealt_bb_underlying: "USSW5 Curncy",
    position_av: 2500000.25,
    tetb_av: 2485000.50,
    position_qty: 50000000,
    tetb_qty: 50000000,
    tetb_match: true,
    status: "Centralise",
    priority: "Low",
    sla_status: "Within SLA",
    assigned_to: "Michael Chen",
    created_date: "2024-05-30T11:20:00Z",
    due_date: "2024-06-02T17:00:00Z",
    aging_days: 3
  },
  {
    id: "EXC-2024-004",
    l04_business_area_name: "Credit Trading",
    l06_name: "Corporate Bonds",
    named_no_name: "Microsoft Corp Bond",
    ads_book_code: "CR-CB-004",
    ads_book_path: "/Trading/Credit/Corporate/US",
    system: "Kondor+",
    legal_entity: "Goldman Sachs & Co LLC",
    regulator: "FINRA",
    instrument_id: "MSFT_2.4_2050",
    equity_class_path: "/Bonds/Corporate/US/Technology",
    instrument_type: "Corporate Bond",
    instrument_name: "Microsoft Corp 2.4% 08-Aug-2050",
    position_tbbb_classification: "Level 2",
    as_of_time: "2024-06-02T09:00:00Z",
    bb_underlying: "MSFT 2.4 08/08/50",
    reason: "Settlement date mismatch",
    look_through: "Direct",
    sod_dealt_bb_underlying: "MSFT 2.4 08/08/50",
    position_av: 5250000.00,
    tetb_av: 5275000.00,
    position_qty: 5000000,
    tetb_qty: 5025000,
    tetb_match: false,
    status: "Challenge",
    priority: "High",
    sla_status: "SLA Breach",
    assigned_to: "Emily Davis",
    created_date: "2024-05-28T13:15:00Z",
    due_date: "2024-05-31T17:00:00Z",
    aging_days: 5
  },
  {
    id: "EXC-2024-005",
    l04_business_area_name: "FX Trading",
    l06_name: "Major Currency Pairs",
    named_no_name: "EUR/USD Spot",
    ads_book_code: "FX-MAJ-005",
    ads_book_path: "/Trading/FX/Major/EURUSD",
    system: "360T",
    legal_entity: "Goldman Sachs International",
    regulator: "FCA",
    instrument_id: "EURUSD_SPOT",
    equity_class_path: "/FX/Major/EURUSD",
    instrument_type: "FX Spot",
    instrument_name: "EUR/USD Spot Rate",
    position_tbbb_classification: "Level 1",
    as_of_time: "2024-06-02T09:00:00Z",
    bb_underlying: "EURUSD Curncy",
    reason: "Trade booking error",
    look_through: "Direct",
    sod_dealt_bb_underlying: "EURUSD Curncy",
    position_av: 1085000.00,
    tetb_av: 1085000.00,
    position_qty: 1000000,
    tetb_qty: 1000000,
    tetb_match: true,
    status: "Reassignment",
    priority: "Medium",
    sla_status: "Within SLA",
    assigned_to: "David Wilson",
    created_date: "2024-06-02T08:30:00Z",
    due_date: "2024-06-05T17:00:00Z",
    aging_days: 0
  }
];

const AdhocReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState("exceptions");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    let filtered = [...SAMPLE_DATA];

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

    return filtered;
  }, [statusFilter, priorityFilter, searchTerm]);

  const downloadCSV = () => {
    const headers = Object.keys(SAMPLE_DATA[0]);
    const csvContent = [
      headers.join(","),
      ...filteredData.map(item => 
        headers.map(header => {
          const value = item[header as keyof Exception];
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
  };

  const renderExceptionsReport = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
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
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
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
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button onClick={downloadCSV}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredData.length} of {SAMPLE_DATA.length} records
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exception Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(SAMPLE_DATA[0]).map(key => <TableHead key={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={Object.keys(SAMPLE_DATA[0]).length} className="text-center py-8 text-muted-foreground">
                      No data matches the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      {Object.entries(item).map(([key, value]) => (
                        <TableCell key={key} className="max-w-[200px] truncate" title={String(value)}>
                          {key === 'status' || key === 'priority' ? (
                            <Badge variant={
                              (value === 'Challenge' || value === 'Insufficient Data' || value === 'Critical' || value === 'High')
                                ? 'destructive' 
                                : 'secondary'
                            }>
                              {String(value)}
                            </Badge>
                          ) : (
                            String(value)
                          )}
                        </TableCell>
                      ))}
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
    <div className="bg-background h-full w-full">
      <div className="flex justify-end items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Tabs value={selectedReport} onValueChange={setSelectedReport} defaultValue="exceptions">
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

            <TabsContent value="exceptions" className="mt-6">
              {renderExceptionsReport()}
            </TabsContent>

            <TabsContent value="reassignment" className="mt-6">
              {renderReassignmentReport()}
            </TabsContent>

            <TabsContent value="tprt" className="mt-6">
              {renderTPRTReport()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdhocReports;