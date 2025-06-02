import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronRight,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Check,
  X,
  Eye,
  MessageSquare,
  FileText,
  Send,
  Plus,
} from "lucide-react";
import { Exception, L04Category, L06Category, ExceptionFilters } from "@/types/exception";
import { loadAndTransformData } from "@/utils/dataTransform";

// Define role-based access permissions
const ROLE_PERMISSIONS = {
  "FO": ["Unwind", "Centralise"], // Front Office
  "PC": ["Unwind", "Centralise", "Writedown"], // Product Category
  "RIS": ["Unwind", "Centralise", "Writedown", "Challenge"], // Risk
  "RIS MR": ["Unwind", "Centralise", "Writedown", "Challenge", "Reassignment"], // Risk Management Review
  "Admin": ["Unwind", "Centralise", "Writedown", "Insufficient Data", "Challenge", "Reassignment"],
  "Manager": ["Unwind", "Centralise", "Writedown", "Insufficient Data", "Challenge", "Reassignment"],
  "Analyst": ["Insufficient Data", "Challenge"],
  "Viewer": ["Unwind", "Centralise", "Writedown", "Insufficient Data", "Challenge", "Reassignment"]
};

interface Comment {
  id: string;
  exceptionId: string;
  author: string;
  content: string;
  timestamp: string;
  type: "comment" | "query" | "response";
}

interface Query {
  id: string;
  exceptionId: string;
  title: string;
  description: string;
  status: "open" | "pending" | "resolved";
  assignedTo: string;
  createdBy: string;
  createdDate: string;
  responses: Comment[];
}

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

const USERS: User[] = [
  { id: "1", name: "Praveen Kumar", role: "Admin", email: "praveen.kumar@company.com" },
  { id: "2", name: "Sarah Johnson", role: "Manager", email: "sarah.johnson@company.com" },
  { id: "3", name: "Michael Chen", role: "Analyst", email: "michael.chen@company.com" },
  { id: "4", name: "Emily Davis", role: "RIS", email: "emily.davis@company.com" },
  { id: "5", name: "David Wilson", role: "FO", email: "david.wilson@company.com" },
];

interface WorkflowTabProps {
  currentUser?: User;
}

const WorkflowTab: React.FC<WorkflowTabProps> = ({
  currentUser = USERS[0], // Default to first user
}) => {
  const [l04Categories, setL04Categories] = useState<L04Category[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [selectedL04, setSelectedL04] = useState<L04Category | null>(null);
  const [selectedL06, setSelectedL06] = useState<L06Category | null>(null);
  const [selectedExceptions, setSelectedExceptions] = useState<string[]>([]);
  const [expandedL04, setExpandedL04] = useState<Set<string>>(new Set());
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean;
    action: string;
  }>({ open: false, action: "" });
  const [bulkActionData, setBulkActionData] = useState({
    status: "",
    assignee: "",
    comments: "",
  });
  
  // Exception detail view state
  const [selectedExceptionDetail, setSelectedExceptionDetail] = useState<Exception | null>(null);
  const [exceptionDetailDialog, setExceptionDetailDialog] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newQuery, setNewQuery] = useState({ title: "", description: "", assignedTo: "" });
  const [showNewQueryForm, setShowNewQueryForm] = useState(false);

  // Initialize with data from core data transformation
  useEffect(() => {
    const data = loadAndTransformData();
    setL04Categories(data.l04_categories);
    setExceptions(data.exceptions);
    
    // Initialize sample comments and queries
    generateSampleCommentsAndQueries(data.exceptions);
  }, []);

  // Generate sample comments and queries for demo
  const generateSampleCommentsAndQueries = (exceptions: Exception[]) => {
    const sampleComments: Comment[] = [];
    const sampleQueries: Query[] = [];
    
    exceptions.slice(0, 5).forEach(exc => {
      // Add some comments
      if (Math.random() > 0.5) {
        sampleComments.push({
          id: `comment-${exc.id}-1`,
          exceptionId: exc.id,
          author: USERS[Math.floor(Math.random() * USERS.length)].name,
          content: "Initial analysis completed. Position reconciliation shows discrepancy in settlement date.",
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: "comment"
        });
      }
      
      // Add some queries
      if (Math.random() > 0.7) {
        const query: Query = {
          id: `query-${exc.id}-1`,
          exceptionId: exc.id,
          title: "Clarification needed on settlement instructions",
          description: "Please provide additional details on the settlement instructions for this position.",
          status: Math.random() > 0.5 ? "open" : "pending",
          assignedTo: USERS[Math.floor(Math.random() * USERS.length)].name,
          createdBy: currentUser.name,
          createdDate: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
          responses: []
        };
        sampleQueries.push(query);
      }
    });
    
    setComments(sampleComments);
    setQueries(sampleQueries);
  };

  // Get role-based accessible statuses
  const getAccessibleStatuses = (userRole: string): string[] => {
    return ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
  };

  // Handle exception detail view
  const handleViewException = (exception: Exception) => {
    setSelectedExceptionDetail(exception);
    setExceptionDetailDialog(true);
  };

  // Add comment
  const handleAddComment = () => {
    if (!newComment.trim() || !selectedExceptionDetail) return;
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      exceptionId: selectedExceptionDetail.id,
      author: currentUser.name,
      content: newComment,
      timestamp: new Date().toISOString(),
      type: "comment"
    };
    
    setComments([...comments, comment]);
    setNewComment("");
  };

  // Add query
  const handleAddQuery = () => {
    if (!newQuery.title.trim() || !newQuery.description.trim() || !selectedExceptionDetail) return;
    
    const query: Query = {
      id: `query-${Date.now()}`,
      exceptionId: selectedExceptionDetail.id,
      title: newQuery.title,
      description: newQuery.description,
      status: "open",
      assignedTo: newQuery.assignedTo,
      createdBy: currentUser.name,
      createdDate: new Date().toISOString(),
      responses: []
    };
    
    setQueries([...queries, query]);
    setNewQuery({ title: "", description: "", assignedTo: "" });
    setShowNewQueryForm(false);
  };

  // Get comments for exception
  const getExceptionComments = (exceptionId: string): Comment[] => {
    return comments.filter(c => c.exceptionId === exceptionId);
  };

  // Get queries for exception
  const getExceptionQueries = (exceptionId: string): Query[] => {
    return queries.filter(q => q.exceptionId === exceptionId);
  };

  const toggleL04Expansion = (l04Name: string) => {
    const newExpanded = new Set(expandedL04);
    if (newExpanded.has(l04Name)) {
      newExpanded.delete(l04Name);
    } else {
      newExpanded.add(l04Name);
    }
    setExpandedL04(newExpanded);
  };

  const handleL04Select = (l04: L04Category) => {
    setSelectedL04(l04);
    setSelectedL06(null);
    setSelectedExceptions([]);
  };

  const handleL06Select = (l06: L06Category) => {
    setSelectedL06(l06);
    setSelectedExceptions([]);
  };

  const handleExceptionSelect = (exceptionId: string, checked: boolean) => {
    if (checked) {
      setSelectedExceptions([...selectedExceptions, exceptionId]);
    } else {
      setSelectedExceptions(selectedExceptions.filter(id => id !== exceptionId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredExceptions.length > 0) {
      setSelectedExceptions(filteredExceptions.map(exc => exc.id));
    } else {
      setSelectedExceptions([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Unwind":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Centralise":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "Writedown":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "Insufficient Data":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Challenge":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "Reassignment":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500";
      case "High":
        return "bg-orange-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAgingColor = (daysOpen: number, slaStatus: string) => {
    // Color based on SLA status and days open
    if (slaStatus === "SLA Breach" || daysOpen > 14) {
      return {
        bg: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
        text: "text-red-900 dark:text-red-300",
        badge: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300",
        indicator: "bg-red-500"
      };
    } else if (slaStatus === "SLA Warning" || daysOpen > 7) {
      return {
        bg: "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
        text: "text-orange-900 dark:text-orange-300",
        badge: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300",
        indicator: "bg-orange-500"
      };
    } else if (daysOpen > 3) {
      return {
        bg: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
        text: "text-yellow-900 dark:text-yellow-300",
        badge: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300",
        indicator: "bg-yellow-500"
      };
    } else {
      return {
        bg: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
        text: "text-green-900 dark:text-green-300",
        badge: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300",
        indicator: "bg-green-500"
      };
    }
  };

  const getAgingLabel = (daysOpen: number, slaStatus: string) => {
    if (slaStatus === "SLA Breach") return "SLA Breached";
    if (slaStatus === "SLA Warning") return "At Risk";
    if (daysOpen === 0) return "New";
    if (daysOpen === 1) return "1 day";
    return `${daysOpen} days`;
  };

  const handleBulkAction = (action: string) => {
    setBulkActionDialog({ open: true, action });
  };

  const executeBulkAction = () => {
    // In a real application, this would call an API
    console.log("Executing bulk action:", bulkActionDialog.action, {
      exceptions: selectedExceptions,
      data: bulkActionData,
    });

    setBulkActionDialog({ open: false, action: "" });
    setBulkActionData({ status: "", assignee: "", comments: "" });
    setSelectedExceptions([]);
  };

  // Filter exceptions based on selected L04/L06 and other filters
  const filteredExceptions = exceptions.filter(exc => {
    // Filter by L04 selection
    if (selectedL04 && exc.l04_business_area_name !== selectedL04.name) {
      return false;
    }
    
    // Filter by L06 selection
    if (selectedL06 && exc.l06_name !== selectedL06.name) {
      return false;
    }
    
    // Role-based filtering
    if (filterRole !== "all" && exc.assigned_to !== currentUser.name) {
      return false;
    }
    
    // Status filtering based on role permissions
    const accessibleStatuses = getAccessibleStatuses(currentUser.role);
    if (!accessibleStatuses.includes(exc.status)) {
      return false;
    }
    
    // Status filter
    if (filterStatus !== "all" && exc.status !== filterStatus) {
      return false;
    }
    
    return true;
  });

  const filteredL04Categories = l04Categories.filter(l04 =>
    l04.name && typeof l04.name === 'string' && 
    l04.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* Left Panel - L04/L06 Categories */}
      <div className={`space-y-4 transition-all duration-300 ${selectedL04 ? 'w-1/4' : 'w-full'}`}>
        <Card>
          <CardHeader className="pb-3">
            <div className="space-y-3">
              <CardTitle className="text-lg">L04 Business Areas</CardTitle>
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Search business areas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                {selectedL04 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate">
                      Selected: {selectedL04.name}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedL04(null);
                        setSelectedL06(null);
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredL04Categories.map((l04) => (
              <Collapsible
                key={l04.name}
                open={expandedL04.has(l04.name)}
                onOpenChange={() => toggleL04Expansion(l04.name)}
              >
                <CollapsibleTrigger asChild>
                  <div
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedL04?.name === l04.name ? "bg-muted border-primary" : ""
                    }`}
                    onClick={() => handleL04Select(l04)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {expandedL04.has(l04.name) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm leading-tight truncate" title={l04.name}>
                              {l04.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {l04.count} exceptions
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              {l04.count}
                            </Badge>
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              {l04.l06_categories.length} L06
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-7 pt-2">
                  <div className="space-y-1">
                    {l04.l06_categories.map((l06) => (
                      <div
                        key={l06.name}
                        className={`flex items-center justify-between p-2 text-sm rounded cursor-pointer hover:bg-muted/30 transition-colors ${
                          selectedL06?.name === l06.name ? "bg-muted/50 border border-primary/50" : "bg-muted/20"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleL06Select(l06);
                        }}
                      >
                        <span className="truncate" title={l06.name}>{l06.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {l06.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Exception Details */}
      <div className={`space-y-4 transition-all duration-300 ${selectedL04 ? 'w-3/4' : 'hidden'}`}>
        {selectedL04 ? (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {selectedL06 ? `${selectedL06.name} Exceptions` : `${selectedL04.name} Exceptions`}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="mine">My Tasks</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {getAccessibleStatuses(currentUser.role).map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Aging Legend */}
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-medium">Aging:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>0-3 days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>4-7 days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>8-14 days / At Risk</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>15+ days / SLA Breached</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={
                          selectedExceptions.length === filteredExceptions.length &&
                          filteredExceptions.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="text-sm">
                        {selectedExceptions.length} of {filteredExceptions.length} selected
                      </span>
                    </div>
                    {selectedExceptions.length > 0 && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction("status")}
                        >
                          Update Status
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction("assign")}
                        >
                          Reassign
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction("approve")}
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Exception</TableHead>
                        <TableHead>Instrument</TableHead>
                        <TableHead>System</TableHead>
                        <TableHead>TETB Match</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Aging</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExceptions.map((exception) => {
                        const agingColors = getAgingColor(exception.aging_days, exception.sla_status);
                        
                        return (
                          <TableRow 
                            key={exception.id}
                            className={`${agingColors.bg} hover:opacity-80 transition-opacity`}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedExceptions.includes(exception.id)}
                                onCheckedChange={(checked) =>
                                  handleExceptionSelect(exception.id, checked as boolean)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm font-mono">{exception.id}</p>
                                <p className="text-xs text-muted-foreground">
                                  {exception.l06_name}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{exception.named_no_name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]" title={exception.instrument_name}>
                                  {exception.instrument_name}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {exception.system}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={exception.tetb_match ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}>
                                {exception.tetb_match ? "Match" : "Mismatch"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getStatusColor(exception.status)}
                              >
                                {exception.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${getPriorityColor(exception.priority)}`}
                                />
                                <span className="text-sm">{exception.priority}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${getAgingColor(exception.aging_days, exception.sla_status).indicator}`}
                                />
                                <div className="flex flex-col">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getAgingColor(exception.aging_days, exception.sla_status).badge}`}
                                  >
                                    {getAgingLabel(exception.aging_days, exception.sla_status)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    SLA: {exception.sla_status}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewException(exception)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {filteredExceptions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            No exceptions found for the selected criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Business Area</h3>
                <p className="text-muted-foreground">
                  Choose an L04 business area from the left panel to view exceptions
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bulk Action Dialog */}
      <Dialog
        open={bulkActionDialog.open}
        onOpenChange={(open) => setBulkActionDialog({ ...bulkActionDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Bulk {bulkActionDialog.action === "status" ? "Status Update" : 
                    bulkActionDialog.action === "assign" ? "Reassignment" : "Approval"}
            </DialogTitle>
            <DialogDescription>
              Apply changes to {selectedExceptions.length} selected exceptions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {bulkActionDialog.action === "status" && (
              <div>
                <Label htmlFor="status">New Status</Label>
                <Select
                  value={bulkActionData.status}
                  onValueChange={(value) =>
                    setBulkActionData({ ...bulkActionData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unwind">Unwind</SelectItem>
                    <SelectItem value="Centralise">Centralise</SelectItem>
                    <SelectItem value="Writedown">Writedown</SelectItem>
                    <SelectItem value="Insufficient Data">Insufficient Data</SelectItem>
                    <SelectItem value="Challenge">Challenge</SelectItem>
                    <SelectItem value="Reassignment">Reassignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {bulkActionDialog.action === "assign" && (
              <div>
                <Label htmlFor="assignee">Assign To</Label>
                <Select
                  value={bulkActionData.assignee}
                  onValueChange={(value) =>
                    setBulkActionData({ ...bulkActionData, assignee: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {USERS.map((user) => (
                      <SelectItem key={user.id} value={user.name}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                placeholder="Add comments for this bulk action..."
                value={bulkActionData.comments}
                onChange={(e) =>
                  setBulkActionData({ ...bulkActionData, comments: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkActionDialog({ open: false, action: "" })}
            >
              Cancel
            </Button>
            <Button onClick={executeBulkAction}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exception Detail Dialog */}
      <Dialog
        open={exceptionDetailDialog}
        onOpenChange={setExceptionDetailDialog}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exception Details - {selectedExceptionDetail?.id}
            </DialogTitle>
            <DialogDescription>
              View and manage exception details, comments, and queries
            </DialogDescription>
          </DialogHeader>
          
          {selectedExceptionDetail && (
            <Tabs defaultValue="details" className="flex-1 overflow-hidden">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="comments" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments ({getExceptionComments(selectedExceptionDetail.id).length})
                </TabsTrigger>
                <TabsTrigger value="queries" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Queries ({getExceptionQueries(selectedExceptionDetail.id).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">L04 Business Area</Label>
                        <p className="text-sm text-muted-foreground">{selectedExceptionDetail.l04_business_area_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">L06 Category</Label>
                        <p className="text-sm text-muted-foreground">{selectedExceptionDetail.l06_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Instrument Name</Label>
                        <p className="text-sm text-muted-foreground">{selectedExceptionDetail.instrument_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge className={getStatusColor(selectedExceptionDetail.status)}>
                          {selectedExceptionDetail.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(selectedExceptionDetail.priority)}`} />
                          <span className="text-sm">{selectedExceptionDetail.priority}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Assigned To</Label>
                        <p className="text-sm text-muted-foreground">{selectedExceptionDetail.assigned_to}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Created Date</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedExceptionDetail.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Days Open</Label>
                        <p className="text-sm text-muted-foreground">{selectedExceptionDetail.aging_days} days</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Business Information</Label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>ADS Book Code: {selectedExceptionDetail.ads_book_code}</div>
                        <div>System: {selectedExceptionDetail.system}</div>
                        <div>Legal Entity: {selectedExceptionDetail.legal_entity}</div>
                        <div>Regulator: {selectedExceptionDetail.regulator}</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Position Details</Label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Position AV: {formatCurrency(selectedExceptionDetail.position_av)}</div>
                        <div>TETB AV: {formatCurrency(selectedExceptionDetail.tetb_av)}</div>
                        <div>Position Qty: {formatNumber(selectedExceptionDetail.position_qty)}</div>
                        <div>TETB Qty: {formatNumber(selectedExceptionDetail.tetb_qty)}</div>
                        <div>TETB Match: {selectedExceptionDetail.tetb_match ? "Yes" : "No"}</div>
                        <div>Reason: {selectedExceptionDetail.reason}</div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="comments" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Comments</Label>
                    <Button
                      size="sm"
                      onClick={() => setNewComment("")}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Comment
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Post Comment
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {getExceptionComments(selectedExceptionDetail.id).map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                      {getExceptionComments(selectedExceptionDetail.id).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No comments yet. Add the first comment above.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="queries" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Queries</Label>
                    <Button
                      size="sm"
                      onClick={() => setShowNewQueryForm(!showNewQueryForm)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      New Query
                    </Button>
                  </div>
                  
                  {showNewQueryForm && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <Label htmlFor="queryTitle">Query Title</Label>
                          <Input
                            id="queryTitle"
                            placeholder="Enter query title..."
                            value={newQuery.title}
                            onChange={(e) => setNewQuery({ ...newQuery, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="queryDescription">Description</Label>
                          <Textarea
                            id="queryDescription"
                            placeholder="Describe your query..."
                            value={newQuery.description}
                            onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="queryAssignee">Assign To</Label>
                          <Select
                            value={newQuery.assignedTo}
                            onValueChange={(value) => setNewQuery({ ...newQuery, assignedTo: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select assignee" />
                            </SelectTrigger>
                            <SelectContent>
                              {USERS.map((user) => (
                                <SelectItem key={user.id} value={user.name}>
                                  {user.name} ({user.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleAddQuery}
                            disabled={!newQuery.title.trim() || !newQuery.description.trim()}
                          >
                            Create Query
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowNewQueryForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {getExceptionQueries(selectedExceptionDetail.id).map((query) => (
                        <Card key={query.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{query.title}</h4>
                              <Badge
                                variant={query.status === "open" ? "destructive" : 
                                        query.status === "pending" ? "default" : "secondary"}
                              >
                                {query.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{query.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Created by {query.createdBy}</span>
                              <span>Assigned to {query.assignedTo}</span>
                              <span>{new Date(query.createdDate).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {getExceptionQueries(selectedExceptionDetail.id).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No queries yet. Create a new query above.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExceptionDetailDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowTab;