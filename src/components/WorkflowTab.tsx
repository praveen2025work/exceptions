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
  }, []);

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
    if (filterRole === "all") return true;
    return exc.assignedTo === currentUser.name;
  }) || [];

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* Left Panel - Level 6 Groups */}
      <div className="w-3/5 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Level 6 Categories</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
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
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedGroup?.level6 === group.level6 ? "bg-muted border-primary" : ""
                    }`}
                    onClick={() => handleGroupSelect(group)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedGroups.has(group.level6) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div>
                        <h3 className="font-medium">{group.level6}</h3>
                        <p className="text-sm text-muted-foreground">
                          {group.count} exceptions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{group.count}</Badge>
                      {group.workflows.length > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          {group.workflows.length}
                        </Badge>
                      )}
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
      <div className="w-2/5 space-y-4">
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
                        <TableHead>Workflow</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExceptions.map((exception) => {
                        const workflow = selectedGroup.workflows.find(
                          w => w.exceptionId === exception.id
                        );
                        
                        return (
                          <TableRow key={exception.id}>
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
    </div>
  );
};

export default WorkflowTab;