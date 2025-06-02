import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Pause,
  ArrowRight,
  User,
  Calendar,
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  X,
} from "lucide-react";
import { Exception } from "@/types/exception";
import { loadAndTransformData } from "@/utils/dataTransform";

// Define the workflow steps
const WORKFLOW_STEPS = [
  { id: 1, name: "FO Owner Action", role: "FO", description: "Front Office owner reviews and takes initial action" },
  { id: 2, name: "OE Request Reassignment", role: "OE", description: "Operations team requests reassignment if needed" },
  { id: 3, name: "PC Rep Approval", role: "PC", description: "Product Category representative provides approval" },
  { id: 4, name: "RES Approval", role: "RES", description: "Resolution team provides final approval" },
  { id: 5, name: "RI Mar Approval", role: "RI", description: "Risk Management approval for market risk" },
  { id: 6, name: "REG Report", role: "REG", description: "Regulatory reporting and final documentation" },
];

// Define users
const USERS = [
  { id: "1", name: "Praveen Kumar", role: "Admin", email: "praveen.kumar@company.com" },
  { id: "2", name: "Sarah Johnson", role: "Manager", email: "sarah.johnson@company.com" },
  { id: "3", name: "Michael Chen", role: "Analyst", email: "michael.chen@company.com" },
  { id: "4", name: "Emily Davis", role: "RIS", email: "emily.davis@company.com" },
  { id: "5", name: "David Wilson", role: "FO", email: "david.wilson@company.com" },
];

interface WorkflowException extends Exception {
  currentStep: number;
  overallStatus: "Not Started" | "In Progress" | "Completed" | "Blocked" | "On Hold";
  stepStatuses: Record<number, "pending" | "in_progress" | "completed" | "blocked">;
  stepAssignees: Record<number, string>;
  stepComments: Record<number, string>;
  stepCompletedDates: Record<number, string>;
}

interface WorkflowStepTabProps {
  currentUser?: any;
}

const WorkflowStepTab: React.FC<WorkflowStepTabProps> = ({
  currentUser = USERS[0],
}) => {
  const [exceptions, setExceptions] = useState<WorkflowException[]>([]);
  const [filteredExceptions, setFilteredExceptions] = useState<WorkflowException[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stepFilter, setStepFilter] = useState("all");
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    exception: WorkflowException | null;
    step: number;
    action: "approve" | "reject" | "reassign" | "comment";
  }>({ open: false, exception: null, step: 0, action: "approve" });
  const [actionData, setActionData] = useState({
    comments: "",
    assignee: "",
    reason: "",
  });

  // Initialize with sample data and workflow information
  useEffect(() => {
    const data = loadAndTransformData();
    const workflowExceptions: WorkflowException[] = data.exceptions.map((exc, index) => {
      const currentStep = Math.floor(Math.random() * 7); // 0 = not started, 1-6 = steps
      const overallStatus = currentStep === 0 ? "Not Started" : 
                           currentStep === 6 ? "Completed" : 
                           Math.random() > 0.9 ? "Blocked" : 
                           Math.random() > 0.95 ? "On Hold" : "In Progress";
      
      const stepStatuses: Record<number, "pending" | "in_progress" | "completed" | "blocked"> = {};
      const stepAssignees: Record<number, string> = {};
      const stepComments: Record<number, string> = {};
      const stepCompletedDates: Record<number, string> = {};
      
      // Set step statuses based on current step
      for (let i = 1; i <= 6; i++) {
        if (i < currentStep) {
          stepStatuses[i] = "completed";
          stepAssignees[i] = USERS[Math.floor(Math.random() * USERS.length)].name;
          stepComments[i] = `Step ${i} completed successfully`;
          stepCompletedDates[i] = new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString();
        } else if (i === currentStep && overallStatus === "In Progress") {
          stepStatuses[i] = "in_progress";
          stepAssignees[i] = USERS[Math.floor(Math.random() * USERS.length)].name;
        } else if (i === currentStep && overallStatus === "Blocked") {
          stepStatuses[i] = "blocked";
          stepAssignees[i] = USERS[Math.floor(Math.random() * USERS.length)].name;
          stepComments[i] = "Blocked pending additional information";
        } else {
          stepStatuses[i] = "pending";
        }
      }

      return {
        ...exc,
        currentStep,
        overallStatus,
        stepStatuses,
        stepAssignees,
        stepComments,
        stepCompletedDates,
      };
    });

    setExceptions(workflowExceptions);
    setFilteredExceptions(workflowExceptions);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...exceptions];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(exc =>
        exc.id.toLowerCase().includes(searchLower) ||
        exc.instrument_name?.toLowerCase().includes(searchLower) ||
        exc.instrument_id.toLowerCase().includes(searchLower) ||
        exc.l06_name?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(exc => exc.overallStatus === statusFilter);
    }

    // Step filter
    if (stepFilter !== "all") {
      const stepNum = parseInt(stepFilter);
      filtered = filtered.filter(exc => exc.currentStep === stepNum);
    }

    setFilteredExceptions(filtered);
  }, [exceptions, searchTerm, statusFilter, stepFilter]);

  const getStepProgress = (exception: WorkflowException): number => {
    const completedSteps = Object.values(exception.stepStatuses).filter(status => status === "completed").length;
    return (completedSteps / 6) * 100;
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-100 text-gray-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Blocked":
        return "bg-red-100 text-red-800";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStepStatusIcon = (status: "pending" | "in_progress" | "completed" | "blocked") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Play className="h-4 w-4 text-blue-600" />;
      case "blocked":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepStatusColor = (status: "pending" | "in_progress" | "completed" | "blocked") => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCurrentStepName = (exception: WorkflowException): string => {
    if (exception.currentStep === 0) return "Not Started";
    if (exception.currentStep > 6) return "Completed";
    return WORKFLOW_STEPS[exception.currentStep - 1]?.name || "Unknown";
  };

  const handleStepAction = (exception: WorkflowException, step: number, action: "approve" | "reject" | "reassign" | "comment") => {
    setActionDialog({ open: true, exception, step, action });
    setActionData({ comments: "", assignee: "", reason: "" });
  };

  const executeStepAction = () => {
    if (!actionDialog.exception) return;

    const updatedException = { ...actionDialog.exception };
    const { step, action } = actionDialog;

    switch (action) {
      case "approve":
        updatedException.stepStatuses[step] = "completed";
        updatedException.stepComments[step] = actionData.comments || `Step ${step} approved`;
        updatedException.stepCompletedDates[step] = new Date().toISOString();
        
        // Move to next step if not the last step
        if (step < 6) {
          updatedException.currentStep = step + 1;
          updatedException.stepStatuses[step + 1] = "in_progress";
          updatedException.stepAssignees[step + 1] = USERS[Math.floor(Math.random() * USERS.length)].name;
        } else {
          updatedException.overallStatus = "Completed";
          updatedException.currentStep = 7;
        }
        break;

      case "reject":
        updatedException.stepStatuses[step] = "blocked";
        updatedException.stepComments[step] = actionData.reason || `Step ${step} rejected`;
        updatedException.overallStatus = "Blocked";
        break;

      case "reassign":
        updatedException.stepAssignees[step] = actionData.assignee;
        updatedException.stepComments[step] = actionData.comments || `Step ${step} reassigned to ${actionData.assignee}`;
        break;

      case "comment":
        updatedException.stepComments[step] = actionData.comments;
        break;
    }

    // Update the exception in the list
    setExceptions(prev => prev.map(exc => 
      exc.id === updatedException.id ? updatedException : exc
    ));

    setActionDialog({ open: false, exception: null, step: 0, action: "approve" });
    setActionData({ comments: "", assignee: "", reason: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Workflow Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exceptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stepFilter} onValueChange={setStepFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by current step" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Steps</SelectItem>
                  <SelectItem value="0">Not Started</SelectItem>
                  {WORKFLOW_STEPS.map((step) => (
                    <SelectItem key={step.id} value={step.id.toString()}>
                      {step.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredExceptions.length} exceptions
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Split View: Table and Details Panel */}
      <div className="flex gap-6 h-[calc(100vh-300px)]">
        {/* Left Panel - Exceptions Table */}
        <div className={`transition-all duration-300 ${selectedExceptionId ? 'w-1/2' : 'w-full'}`}>
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <div className="overflow-auto h-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exception ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Overall Status</TableHead>
                      <TableHead>Current Step</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Days Open</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExceptions.map((exception) => (
                      <TableRow key={exception.id}>
                        <TableCell className="font-mono text-sm">
                          <button
                            onClick={() => setSelectedExceptionId(
                              selectedExceptionId === exception.id ? null : exception.id
                            )}
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {exception.id}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{exception.instrument_name}</p>
                            <p className="text-xs text-muted-foreground">{exception.l06_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getOverallStatusColor(exception.overallStatus)}>
                            {exception.overallStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStepStatusIcon(exception.stepStatuses[exception.currentStep] || "pending")}
                            <span className="text-sm">{getCurrentStepName(exception)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={getStepProgress(exception)} className="w-20 h-2" />
                            <span className="text-xs text-muted-foreground">
                              {Math.round(getStepProgress(exception))}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {exception.stepAssignees[exception.currentStep] || "Unassigned"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{exception.aging_days}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {exception.currentStep > 0 && exception.currentStep <= 6 && 
                             exception.stepStatuses[exception.currentStep] === "in_progress" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStepAction(exception, exception.currentStep, "approve")}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStepAction(exception, exception.currentStep, "reject")}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedExceptionId(
                                selectedExceptionId === exception.id ? null : exception.id
                              )}
                            >
                              {selectedExceptionId === exception.id ? "Hide" : "Details"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredExceptions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No exceptions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Workflow Details */}
        {selectedExceptionId && (
          <div className="w-1/2">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Workflow Details - {selectedExceptionId}</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedExceptionId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] overflow-auto">
                {(() => {
                  const exception = filteredExceptions.find(exc => exc.id === selectedExceptionId);
                  if (!exception) return null;

                  return (
                    <div className="space-y-6">
                      {/* Exception Summary */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Exception Summary</h4>
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Instrument:</span>
                            <span className="font-medium">{exception.instrument_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Level 6:</span>
                            <span>{exception.l06_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Overall Status:</span>
                            <Badge className={getOverallStatusColor(exception.overallStatus)}>
                              {exception.overallStatus}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Days Open:</span>
                            <span>{exception.aging_days} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Overall Progress:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={getStepProgress(exception)} className="w-20 h-2" />
                              <span className="text-xs">{Math.round(getStepProgress(exception))}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Workflow Steps Progress */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Workflow Steps Progress</h4>
                        <div className="space-y-3">
                          {WORKFLOW_STEPS.map((step) => {
                            const status = exception.stepStatuses[step.id] || "pending";
                            const assignee = exception.stepAssignees[step.id];
                            const comment = exception.stepComments[step.id];
                            const completedDate = exception.stepCompletedDates[step.id];

                            return (
                              <div key={step.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium flex-shrink-0">
                                    {step.id}
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h5 className="font-medium text-sm">{step.name}</h5>
                                      <div className="flex items-center gap-2">
                                        {getStepStatusIcon(status)}
                                        <Badge className={getStepStatusColor(status)} variant="outline">
                                          {status.replace("_", " ")}
                                        </Badge>
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{step.description}</p>
                                    {assignee && (
                                      <p className="text-xs">
                                        <span className="font-medium">Assigned to:</span> {assignee}
                                      </p>
                                    )}
                                    {comment && (
                                      <p className="text-xs">
                                        <span className="font-medium">Comments:</span> {comment}
                                      </p>
                                    )}
                                    {completedDate && (
                                      <p className="text-xs">
                                        <span className="font-medium">Completed:</span>{" "}
                                        {new Date(completedDate).toLocaleDateString()}
                                      </p>
                                    )}
                                    {status === "in_progress" && (
                                      <div className="flex gap-1 mt-2">
                                        <Button
                                          size="sm"
                                          onClick={() => handleStepAction(exception, step.id, "approve")}
                                        >
                                          Approve
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleStepAction(exception, step.id, "reject")}
                                        >
                                          Reject
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleStepAction(exception, step.id, "reassign")}
                                        >
                                          Reassign
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleStepAction(exception, step.id, "comment")}
                                        >
                                          Comment
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => 
        setActionDialog({ ...actionDialog, open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "approve" ? "Approve Step" :
               actionDialog.action === "reject" ? "Reject Step" :
               actionDialog.action === "reassign" ? "Reassign Step" : "Add Comment"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.exception && actionDialog.step > 0 && (
                <>
                  Step {actionDialog.step}: {WORKFLOW_STEPS[actionDialog.step - 1]?.name} for exception {actionDialog.exception.id}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {actionDialog.action === "reassign" && (
              <div>
                <Label htmlFor="assignee">Assign To</Label>
                <Select
                  value={actionData.assignee}
                  onValueChange={(value) => setActionData({ ...actionData, assignee: value })}
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
            {actionDialog.action === "reject" && (
              <div>
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for rejection..."
                  value={actionData.reason}
                  onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                />
              </div>
            )}
            <div>
              <Label htmlFor="comments">
                {actionDialog.action === "comment" ? "Comment" : "Additional Comments"}
              </Label>
              <Textarea
                id="comments"
                placeholder="Add your comments..."
                value={actionData.comments}
                onChange={(e) => setActionData({ ...actionData, comments: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, exception: null, step: 0, action: "approve" })}
            >
              Cancel
            </Button>
            <Button onClick={executeStepAction}>
              {actionDialog.action === "approve" ? "Approve" :
               actionDialog.action === "reject" ? "Reject" :
               actionDialog.action === "reassign" ? "Reassign" : "Add Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowStepTab;