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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Exception,
  PositionException,
  mapPositionToException,
  generateSampleExceptions,
  USERS,
} from "@/types/exception";

interface ExceptionListProps {
  exceptions?: Exception[];
  onExceptionSelect?: (exception: Exception) => void;
  onBulkAction?: (action: string, exceptionIds: string[]) => void;
  filters?: {
    bookCode: string;
    system: string;
    legalEntity: string;
    regulator: string;
    status: string;
  };
  workflowStatus?: Record<string, string>;
}

const ExceptionList: React.FC<ExceptionListProps> = ({
  exceptions: propExceptions,
  onExceptionSelect = () => {},
  onBulkAction = () => {},
  filters: propFilters = {
    bookCode: "",
    system: "",
    legalEntity: "",
    regulator: "",
    status: "",
  },
  workflowStatus = {},
}) => {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [selectedExceptions, setSelectedExceptions] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Exception>("createdDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(propFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean;
    action: string;
  }>({ open: false, action: "" });
  const [bulkActionData, setBulkActionData] = useState({
    status: "",
    assignee: "",
    comments: "",
  });

  const itemsPerPage = 15;

  // Initialize exceptions data
  useEffect(() => {
    if (propExceptions) {
      setExceptions(propExceptions);
    } else {
      // Generate sample data if none provided
      const sampleData = generateSampleExceptions(200);
      setExceptions(sampleData);
    }
  }, [propExceptions]);

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
        exception.instrumentId,
        exception.bookCode,
        exception.instrumentName,
        exception.classification,
        exception.status,
        exception.priority,
        exception.system,
        exception.legalEntity,
        exception.regulator,
        exception.level6,
        exception.assignedTo,
        exception.reason
      ].filter(Boolean);
      
      const matchesSearch = searchableFields.some(field => 
        field?.toString().toLowerCase().includes(searchLower)
      );
      
      if (!matchesSearch) return false;
    }

    // Apply filters
    if (
      filters.bookCode &&
      !exception.bookCode?.toLowerCase().includes(filters.bookCode.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.system &&
      filters.system !== "all" &&
      exception.system !== filters.system
    ) {
      return false;
    }
    if (
      filters.legalEntity &&
      filters.legalEntity !== "all" &&
      exception.legalEntity !== filters.legalEntity
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
        return "bg-green-100 text-green-800";
      case "At Risk":
        return "bg-yellow-100 text-yellow-800";
      case "Breached":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-blue-100 text-blue-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Critical":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-purple-100 text-purple-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Exceptions ({filteredExceptions.length})
        </h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search exceptions..." 
              className="pl-8 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => {
              setSearchTerm("");
              setFilters({
                bookCode: "",
                system: "",
                legalEntity: "",
                regulator: "",
                status: "",
              });
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Clear Filters
          </Button>
          <Select 
            value={filters.status || "all"} 
            onValueChange={(value) => 
              setFilters({...filters, status: value === "all" ? "" : value})
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.system || "all"} 
            onValueChange={(value) => 
              setFilters({...filters, system: value === "all" ? "" : value})
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="System" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Systems</SelectItem>
              <SelectItem value="COMPASS">COMPASS</SelectItem>
              <SelectItem value="AMM">AMM</SelectItem>
              <SelectItem value="Atlas">Atlas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedExceptions.length > 0 && (
        <div className="bg-gray-50 p-2 rounded-md mb-4 flex justify-between items-center">
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

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    paginatedExceptions.length > 0 &&
                    selectedExceptions.length === paginatedExceptions.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("instrumentId")}
              >
                <div className="flex items-center">
                  Instrument ID
                  {sortField === "instrumentId" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("bookCode")}
              >
                <div className="flex items-center">
                  Book Code
                  {sortField === "bookCode" &&
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
                onClick={() => handleSort("classification")}
              >
                <div className="flex items-center">
                  Classification
                  {sortField === "classification" &&
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
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center">
                  Priority
                  {sortField === "priority" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("daysOpen")}
              >
                <div className="flex items-center">
                  Days Open
                  {sortField === "daysOpen" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("level6")}
              >
                <div className="flex items-center">
                  Level 6
                  {sortField === "level6" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("slaStatus")}
              >
                <div className="flex items-center">
                  SLA Status
                  {sortField === "slaStatus" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="w-10">Actions</TableHead>
              <TableHead className="w-[120px]">Workflow</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedExceptions.map((exception) => (
              <React.Fragment key={exception.id}>
                <TableRow
                  className="cursor-pointer hover:bg-gray-50"
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
                  <TableCell className="font-mono text-sm">{exception.instrumentId}</TableCell>
                  <TableCell className="font-mono text-sm">{exception.bookCode}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {exception.system}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={exception.classification}>
                    {exception.classification}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(exception.status)}>
                      {exception.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(exception.priority)}>
                      {exception.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{exception.daysOpen}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {exception.level6}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSLAStatusColor(exception.slaStatus)}>
                      {exception.slaStatus}
                    </Badge>
                  </TableCell>
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
                  <TableCell>
                    {workflowStatus[exception.id] ? (
                      <Badge className={`bg-blue-100 text-blue-800`}>
                        {workflowStatus[exception.id]}
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBulkAction("trigger-workflow", [exception.id]);
                        }}
                      >
                        Start Workflow
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {expandedRows.includes(exception.id) && (
                  <TableRow>
                    <TableCell colSpan={12} className="bg-gray-50 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 text-sm">Level Hierarchy</h4>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-medium">Level 1:</span> {exception.level1}</p>
                            <p><span className="font-medium">Level 2:</span> {exception.level2}</p>
                            <p><span className="font-medium">Level 3:</span> {exception.level3}</p>
                            <p><span className="font-medium">Level 4:</span> {exception.level4}</p>
                            <p><span className="font-medium">Level 5:</span> {exception.level5}</p>
                            <p><span className="font-medium">Level 6:</span> {exception.level6}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-sm">Position Details</h4>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-medium">Instrument Name:</span> {exception.instrumentName}</p>
                            <p><span className="font-medium">Equity Class:</span> {exception.equityClassType}</p>
                            <p><span className="font-medium">Instrument Type:</span> {exception.instrumentType}</p>
                            <p><span className="font-medium">Position Qty:</span> {exception.positionQty}</p>
                            <p><span className="font-medium">Position AV:</span> {exception.positionAV}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-sm">System Information</h4>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-medium">Legal Entity:</span> {exception.legalEntity}</p>
                            <p><span className="font-medium">Regulator:</span> {exception.regulator}</p>
                            <p><span className="font-medium">BB Underlying:</span> {exception.bbUnderlying}</p>
                            <p><span className="font-medium">SOD Delta:</span> {exception.sodDelta}</p>
                            <p><span className="font-medium">Look Through:</span> {exception.lookThrough}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-sm">Exception Details</h4>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-medium">Reason:</span> {exception.reason}</p>
                            <p><span className="font-medium">SDS Book Path:</span> {exception.sdsBookPath}</p>
                            <p><span className="font-medium">As of Time:</span> {exception.asOfTime ? new Date(exception.asOfTime).toLocaleString() : 'N/A'}</p>
                            <p><span className="font-medium">Last Modified:</span> {new Date(exception.lastModified).toLocaleString()}</p>
                            <p><span className="font-medium">Assigned To:</span> {exception.assignedTo || 'Unassigned'}</p>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onExceptionSelect(exception);
                              }}
                            >
                              View Full Details
                            </Button>
                            {!workflowStatus[exception.id] && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onBulkAction("trigger-workflow", [exception.id]);
                                }}
                              >
                                Start Workflow
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
            {paginatedExceptions.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">
                  No exceptions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
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

// Your actual position data
const positionData: PositionException[] = [
  {
    "SDS Book Code": "1014444",
    System: "COMPASS",
    "Legal Entity": "BCINC",
    Regulator: "FRB",
    "Instrument Id": "78838105",
    "Equity Class Type": "Ordinary Share (Ex)",
    "Instrument Type": "ESM",
    "Instrument Name": "OLD BRPR3.SA-78838105-01",
    "Position TBBB Classification": "CentraliseAndWritedown",
    "As of time": "2025-02-27T23:43:01.788Z",
    "BB Underlying": "Sophis/770988/BRPR3.SA-78838105-01",
    "SOD Delta on BB Underlying": "0",
    "Position AV": "0",
    "Position Qty": "589674",
    "Look through": "N/A",
    "SDS Book Path": "Group:Markets:Equities:Cash:Equities:EQ",
    Reason: "RuleEvaluation:001_uleIdentifier:001",
  },
  {
    "SDS Book Code": "1014469",
    System: "COMPASS",
    "Legal Entity": "BCINC",
    Regulator: "FRB",
    "Instrument Id": "78838106",
    "Equity Class Type": "Ordinary Share (Ex)",
    "Instrument Type": "ESM",
    "Instrument Name": "OLD BRPR3.SA-78838105-01",
    "Position TBBB Classification": "CentraliseAndWritedown",
    "As of time": "2025-02-27T23:43:01.788Z",
    "BB Underlying": "BRPR3.SA-78838106-01",
    "SOD Delta on BB Underlying": "0",
    "Position AV": "0",
    "Position Qty": "8700",
    "Look through": "N/A",
    "SDS Book Path": "Group:Markets:Equities:Cash:Equities:EQ",
    Reason: "TradingBook:002",
  },
  {
    "SDS Book Code": "955036",
    System: "AMM",
    "Legal Entity": "BCINC",
    Regulator: "FRB",
    "Instrument Id": "1238414859",
    "Equity Class Type": "Fund (Ex)",
    "Instrument Type": "ESM",
    "Instrument Name": "NVBU.Z",
    "Position TBBB Classification": "Uncertain",
    "As of time": "2025-02-27T23:43:00.692Z",
    "BB Underlying": "Sophis/2548786/NVBU.",
    "SOD Delta on BB Underlying": "1793",
    "Position AV": "0",
    "Position Qty": "1793",
    "Look through": "N",
    "SDS Book Path": "Group:Markets:Equities",
    Reason: "NotApplicable:001",
  },
  {
    "SDS Book Code": "625139",
    System: "Atlas",
    "Legal Entity": "BBPLC",
    Regulator: "PRA",
    "Instrument Id": "254232744",
    "Equity Class Type": "Autocallable Linked Note",
    "Instrument Type": "Sophis",
    "Instrument Name": "UOBPF5 06G26 TN AELNE",
    "Position TBBB Classification": "Uncertain",
    "As of time": "2025-02-27T23:45:55.071Z",
    "BB Underlying": "Sophis/69371580/GLD.P;",
    "SOD Delta on BB Underlying": "-400000",
    "Position AV": "0",
    "Position Qty": "-400000",
    "Look through": "Y",
    "SDS Book Path": "Group:Markets:Equities",
    Reason: "NotApplicable:002",
  },
];

// Convert position data to exceptions
const defaultExceptions: Exception[] = positionData.map(mapPositionToException);

// Add some additional mock data to supplement
defaultExceptions.push(
  {
    id: "10",
    instrumentId: "INST010",
    bookCode: "BC432",
    classification: "Compliance Review",
    status: "Open",
    createdDate: "2025-05-20T08:45:00",
    lastModified: "2025-05-20T08:45:00",
    daysOpen: 8,
    slaStatus: "At Risk",
    priority: "High",
    system: "COMPASS",
    legalEntity: "BCINC",
    regulator: "FRB",
    level6: "Technology",
  },
  {
    id: "11",
    instrumentId: "INST011",
    bookCode: "BC765",
    classification: "Regulatory Exception",
    status: "In Progress",
    createdDate: "2025-05-18T13:30:00",
    lastModified: "2025-05-25T09:20:00",
    daysOpen: 10,
    slaStatus: "At Risk",
    assignedTo: "Olivia Martin",
    priority: "High",
    system: "AMM",
    legalEntity: "BBPLC",
    regulator: "PRA",
    level6: "Healthcare",
  },
  {
    id: "12",
    instrumentId: "INST012",
    bookCode: "BC098",
    classification: "Position Reconciliation",
    status: "Resolved",
    createdDate: "2025-05-15T15:45:00",
    lastModified: "2025-05-22T10:30:00",
    daysOpen: 7,
    slaStatus: "Within SLA",
    assignedTo: "James Taylor",
    priority: "Medium",
    system: "Atlas",
    legalEntity: "BCINC",
    regulator: "FRB",
    level6: "Financial Services",
  },
);

export default ExceptionList;