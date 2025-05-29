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
import {
  Exception,
  Level6Group,
  Workflow,
  WorkflowStep,
  User,
  generateSampleExceptions,
  groupExceptionsByLevel6,
  createWorkflow,
  USERS,
} from "@/types/exception";

// Define role-based access permissions
const ROLE_PERMISSIONS = {
  "FO": ["Open", "In Progress"], // Front Office
  "PC": ["Open", "In Progress", "Resolved"], // Product Category
  "RIS": ["Open", "In Progress", "Resolved", "Closed"], // Risk
  "RIS MR": ["Open", "In Progress", "Resolved", "Closed"], // Risk Management Review
  "Admin": ["Open", "In Progress", "Resolved", "Closed"],
  "Manager": ["Open", "In Progress", "Resolved", "Closed"],
  "Analyst": ["Open", "In Progress"],
  "Viewer": ["Open", "In Progress", "Resolved", "Closed"]
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

interface WorkflowTabProps {
  currentUser?: User;
}

const WorkflowTab: React.FC<WorkflowTabProps> = ({
  currentUser = USERS[0], // Default to first user
}) => {
  const [level6Groups, setLevel6Groups] = useState<Level6Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Level6Group | null>(null);
  const [selectedExceptions, setSelectedExceptions] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
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

  // Initialize with sample data
  useEffect(() => {
    const sampleExceptions = generateSampleExceptions(1000); // Generate 1000 for demo
    const groups = groupExceptionsByLevel6(sampleExceptions);
    
    // Add some workflows to groups
    groups.forEach(group => {
      group.workflows = group.exceptions
        .filter(exc => exc.workflowId)
        .map(exc => createWorkflow(exc.id));
    });
    
    setLevel6Groups(groups);
    
    // Initialize sample comments and queries
    generateSampleCommentsAndQueries(sampleExceptions);
  }, []);

  // Generate sample comments and queries for demo
  const generateSampleCommentsAndQueries = (exceptions: Exception[]) => {
    const sampleComments: Comment[] = [];
    const sampleQueries: Query[] = [];
    
    exceptions.slice(0, 50).forEach(exc => {
      // Add some comments
      if (Math.random() > 0.7) {
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
      if (Math.random() > 0.8) {
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

  const toggleGroupExpansion = (level6: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(level6)) {
      newExpanded.delete(level6);
    } else {
      newExpanded.add(level6);
    }
    setExpandedGroups(newExpanded);
  };

  const handleGroupSelect = (group: Level6Group) => {
    setSelectedGroup(group);
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
    if (checked && selectedGroup) {
      setSelectedExceptions(selectedGroup.exceptions.map(exc => exc.id));
    } else {
      setSelectedExceptions([]);
    }
  };

  const getWorkflowProgress = (workflow: Workflow): number => {
    const completedSteps = workflow.steps.filter(step => step.status === "COMPLETED").length;
    return (completedSteps / workflow.steps.length) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
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
    if (slaStatus === "Breached" || daysOpen > 14) {
      return {
        bg: "bg-red-50 border-red-200",
        text: "text-red-900",
        badge: "bg-red-100 text-red-800 border-red-300",
        indicator: "bg-red-500"
      };
    } else if (slaStatus === "At Risk" || daysOpen > 7) {
      return {
        bg: "bg-orange-50 border-orange-200",
        text: "text-orange-900",
        badge: "bg-orange-100 text-orange-800 border-orange-300",
        indicator: "bg-orange-500"
      };
    } else if (daysOpen > 3) {
      return {
        bg: "bg-yellow-50 border-yellow-200",
        text: "text-yellow-900",
        badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
        indicator: "bg-yellow-500"
      };
    } else {
      return {
        bg: "bg-green-50 border-green-200",
        text: "text-green-900",
        badge: "bg-green-100 text-green-800 border-green-300",
        indicator: "bg-green-500"
      };
    }
  };

  const getAgingLabel = (daysOpen: number, slaStatus: string) => {
    if (slaStatus === "Breached") return "SLA Breached";
    if (slaStatus === "At Risk") return "At Risk";
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

    // Update local state for demo
    if (selectedGroup) {
      const updatedExceptions = selectedGroup.exceptions.map(exc => {
        if (selectedExceptions.includes(exc.id)) {
          const updates: Partial<Exception> = {};
          
          if (bulkActionData.status) {
            updates.status = bulkActionData.status as any;
          }
          if (bulkActionData.assignee) {
            updates.assignedTo = bulkActionData.assignee;
          }
          
          return { ...exc, ...updates };
        }
        return exc;
      });

      const updatedGroup = { ...selectedGroup, exceptions: updatedExceptions };
      setSelectedGroup(updatedGroup);
      
      // Update the main groups array
      setLevel6Groups(groups => 
        groups.map(group => 
          group.level6 === selectedGroup.level6 ? updatedGroup : group
        )
      );
    }

    setBulkActionDialog({ open: false, action: "" });
    setBulkActionData({ status: "", assignee: "", comments: "" });
    setSelectedExceptions([]);
  };

  const filteredGroups = level6Groups.filter(group =>
    group.level6.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExceptions = selectedGroup?.exceptions.filter(exc => {
    // Role-based filtering
    if (filterRole !== "all" && exc.assignedTo !== currentUser.name) {
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
  }) || [];

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* Left Panel - Level 6 Groups */}
      <div className={`space-y-4 transition-all duration-300 ${selectedGroup ? 'w-1/4' : 'w-full'}`}>
        <Card>
          <CardHeader className="pb-3">
            <div className="space-y-3">
              <CardTitle className="text-lg">Level 6 Categories</CardTitle>
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                {selectedGroup && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate">
                      Selected: {selectedGroup.level6}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedGroup(null)}
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
            {filteredGroups.map((group) => (
              <Collapsible
                key={group.level6}
                open={expandedGroups.has(group.level6)}
                onOpenChange={() => toggleGroupExpansion(group.level6)}
              >
                <CollapsibleTrigger asChild>
                  <div
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedGroup?.level6 === group.level6 ? "bg-muted border-primary" : ""
                    }`}
                    onClick={() => handleGroupSelect(group)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {expandedGroups.has(group.level6) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm leading-tight truncate" title={group.level6}>
                              {group.level6}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {group.count} total
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              {group.count}
                            </Badge>
                            {group.workflows.length > 0 && (
                              <Badge variant="outline" className="text-xs px-2 py-0.5 flex items-center gap-1">
                                <Play className="h-2.5 w-2.5" />
                                {group.workflows.length}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-7 pt-2">
                  <div className="space-y-1">
                    {group.exceptions.slice(0, 5).map((exception) => (
                      <div
                        key={exception.id}
                        className="flex items-center justify-between p-2 text-sm bg-muted/30 rounded"
                      >
                        <span>{exception.instrumentName}</span>
                        <Badge
                          variant="outline"
                          className={getStatusColor(exception.status)}
                        >
                          {exception.status}
                        </Badge>
                      </div>
                    ))}
                    {group.exceptions.length > 5 && (
                      <p className="text-xs text-muted-foreground pl-2">
                        +{group.exceptions.length - 5} more exceptions
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Exception Details */}
      <div className={`space-y-4 transition-all duration-300 ${selectedGroup ? 'w-3/4' : 'hidden'}`}>
        {selectedGroup ? (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {selectedGroup.level6} Exceptions
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
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Aging</TableHead>
                        <TableHead>Workflow</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExceptions.map((exception) => {
                        const workflow = selectedGroup.workflows.find(
                          w => w.exceptionId === exception.id
                        );
                        
                        const agingColors = getAgingColor(exception.daysOpen, exception.slaStatus);
                        
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
                                <p className="font-medium text-sm">{exception.instrumentName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {exception.id}
                                </p>
                              </div>
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
                                  className={`w-3 h-3 rounded-full ${getAgingColor(exception.daysOpen, exception.slaStatus).indicator}`}
                                />
                                <div className="flex flex-col">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getAgingColor(exception.daysOpen, exception.slaStatus).badge}`}
                                  >
                                    {getAgingLabel(exception.daysOpen, exception.slaStatus)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    SLA: {exception.slaStatus}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {workflow ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={getWorkflowProgress(workflow)}
                                      className="w-16 h-2"
                                    />
                                    <span className="text-xs">
                                      {Math.round(getWorkflowProgress(workflow))}%
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {workflow.steps.find(s => s.status === "IN_PROGRESS")?.name ||
                                     workflow.steps.find(s => s.status === "PENDING")?.name ||
                                     "Completed"}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">No workflow</span>
                              )}
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
                <h3 className="text-lg font-medium mb-2">Select a Level 6 Category</h3>
                <p className="text-muted-foreground">
                  Choose a category from the left panel to view exceptions and workflows
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
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
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
                        <Label className="text-sm font-medium">Instrument Name</Label>
                        <p className="text-sm text-muted-foreground">{selectedExceptionDetail.instrumentName}</p>
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
                        <p className="text-sm text-muted-foreground">{selectedExceptionDetail.assignedTo}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Created Date</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedExceptionDetail.createdDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Days Open</Label>
                        <p className="text-sm text-muted-foreground">{selectedExceptionDetail.daysOpen} days</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Level Hierarchy</Label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Level 1: {selectedExceptionDetail.level1}</div>
                        <div>Level 2: {selectedExceptionDetail.level2}</div>
                        <div>Level 3: {selectedExceptionDetail.level3}</div>
                        <div>Level 4: {selectedExceptionDetail.level4}</div>
                        <div>Level 5: {selectedExceptionDetail.level5}</div>
                        <div>Level 6: {selectedExceptionDetail.level6}</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Position Details</Label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>System: {selectedExceptionDetail.system}</div>
                        <div>Legal Entity: {selectedExceptionDetail.legalEntity}</div>
                        <div>Regulator: {selectedExceptionDetail.regulator}</div>
                        <div>Position AV: {selectedExceptionDetail.positionAV}</div>
                        <div>Position Qty: {selectedExceptionDetail.positionQty}</div>
                        <div>SOD Delta: {selectedExceptionDetail.sodDelta}</div>
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