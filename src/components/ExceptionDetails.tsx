import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Upload,
  Download,
  Trash2,
  Edit,
  Plus,
  MessageSquare,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import {
  ExceptionCategory,
  FileResponse,
  AuditTrailEntry,
  CommentEntry,
  UpdateCommentRequest,
} from "../types/exception";

interface ExceptionDetailsProps {
  exceptionId?: string;
  positionTbbbClassification?: string;
  onClose?: () => void;
  onSave?: (data: any) => void;
}

const ExceptionDetails = ({
  exceptionId = "1020129_131907931_SICOVAM",
  positionTbbbClassification = "BankingBook",
  onClose = () => {},
  onSave = () => {},
}: ExceptionDetailsProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [status, setStatus] = useState("OPEN");
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [categories, setCategories] = useState<ExceptionCategory[]>([]);
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentUser] = useState("Pratik"); // Mock current user
  const { toast } = useToast();

  // Mock exception data
  const exceptionData = {
    id: exceptionId,
    instrumentId: "131907931",
    bookCode: "1020129",
    system: "Atlas",
    legalEntity: "BCSL",
    regulator: "PRA",
    aging: 1,
    positionQty: 1680000,
    originalQty: 1680000,
  };

  // Load exception categories
  useEffect(() => {
    loadExceptionCategories();
    loadFiles();
    loadAuditTrail();
    loadComments();
  }, [positionTbbbClassification, exceptionId]);

  const loadExceptionCategories = async () => {
    try {
      // Mock API call - replace with actual API call
      const mockCategories: ExceptionCategory[] = [
        { id: 2, categoryName: "FO Unwind", classification: "BankingBook" },
        { id: 3, categoryName: "FO Challenge", classification: "BankingBook" },
        { id: 4, categoryName: "FO Request Reassignment", classification: "BankingBook" },
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Error",
        description: "Failed to load exception categories",
        variant: "destructive",
      });
    }
  };

  const loadFiles = async () => {
    try {
      // Mock API call - replace with actual API call
      const mockFiles: FileResponse[] = [];
      setFiles(mockFiles);
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

  const loadAuditTrail = async () => {
    try {
      // Mock API call - replace with actual API call
      const mockAuditTrail: AuditTrailEntry[] = [
        {
          rev: 0,
          exceptionId: "1020129_131907931_SICOVAM",
          revType: "INSERT",
          actions: ["New Exception created"],
          equityClassType: "Fund (Ex)",
          regulator: "PRA",
          aging: 1,
          asOfTime: "2025-09-09 13:40:48",
          bbUnderlyings: "Sophis/131907931/006878.TWO",
          esmSecurityType: "ETF",
          instrumentId: 131907931,
          instrumentName: "00687B.TWO",
          instrumentType: "SICOVAM",
          legalEntity: "BCSL",
          lookThrough: "Y",
          positionAv: 1090157.604272446,
          positionQty: 1680000,
          positionBbbClassification: "BankingBook",
          processed_exceptions: "2025-09-10 14:54:01",
          sdsBookCode: 1020129,
          sdsBookPath: "Barclays Group:Markets:Equities:Prime:Prime Delta 1:APAC:Delta One Synthetics:Index/Sector/CIB:Delta 1 - Non Index PLIS-Taiwan:Conversion - BCSL(15170)",
          sodDeltaOnBbUnderlying: 1090157.60427244,
          status: null,
          system: "Atlas",
          originalQty: 1680000,
        }
      ];
      setAuditTrail(mockAuditTrail);
    } catch (error) {
      console.error("Error loading audit trail:", error);
    }
  };

  const loadComments = async () => {
    try {
      // Mock API call - replace with actual API call
      const mockComments: CommentEntry[] = [
        {
          id: 105,
          brid: "B001",
          comments: "test",
          commentBy: "Pratik",
          commentDate: "2025-09-10T21:19:02.830881300",
        }
      ];
      setComments(mockComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleSave = () => {
    const updatedData = {
      ...exceptionData,
      status,
      selectedWorkflow,
    };
    onSave(updatedData);
    toast({
      title: "Success",
      description: "Exception details updated successfully",
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      // Mock API call - replace with actual API call
      const newCommentEntry: CommentEntry = {
        id: Date.now(),
        brid: "B001",
        comments: newComment,
        commentBy: currentUser,
        commentDate: new Date().toISOString(),
      };
      setComments([...comments, newCommentEntry]);
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editCommentText.trim()) return;

    try {
      // Mock API call - replace with actual API call
      const updatedComments = comments.map(comment =>
        comment.id === commentId
          ? { ...comment, comments: editCommentText }
          : comment
      );
      setComments(updatedComments);
      setEditingComment(null);
      setEditCommentText("");
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      // Mock API call - replace with actual API call
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      setComments(updatedComments);
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      // Mock API call - replace with actual API call
      const newFile: FileResponse = {
        id: Date.now(),
        filename: selectedFile.name,
        filePath: `C:\\Users\\x01590370\\Desktop\\ws\\data\\upload\\${exceptionId}_${selectedFile.name}`,
        uploadedBy: currentUser,
        uploadedDate: new Date().toISOString(),
      };
      setFiles([...files, newFile]);
      setSelectedFile(null);
      setIsUploadDialogOpen(false);
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      // Mock API call - replace with actual API call
      const updatedFiles = files.filter(file => file.id !== fileId);
      setFiles(updatedFiles);
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "IN PROGRESS":
        return "bg-blue-500 hover:bg-blue-600";
      case "RESOLVED":
        return "bg-green-500 hover:bg-green-600";
      case "REJECTED":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const formatAuditChanges = (current: AuditTrailEntry, previous?: AuditTrailEntry) => {
    if (!previous) return null;

    const changes: { field: string; oldValue: any; newValue: any }[] = [];
    
    // Compare key fields
    const fieldsToCompare = [
      'status', 'aging', 'positionQty', 'positionAv', 'legalEntity', 
      'regulator', 'system', 'positionBbbClassification'
    ];

    fieldsToCompare.forEach(field => {
      const currentValue = (current as any)[field];
      const previousValue = (previous as any)[field];
      
      if (currentValue !== previousValue) {
        changes.push({
          field,
          oldValue: previousValue,
          newValue: currentValue
        });
      }
    });

    return changes;
  };

  return (
    <Card className="w-full h-full overflow-hidden flex flex-col bg-background">
      <CardHeader className="border-b pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">
            Exception Details
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
              <TabsTrigger value="documents">Files</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="info" className="p-6 pt-4">
            <div className="space-y-6">
              <h3 className="text-sm font-medium text-foreground mb-4">Complete Exception Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground border-b pb-2">Business Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Exception ID</Label>
                      <Input value={exceptionData.id} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Book Code</Label>
                      <Input value={exceptionData.bookCode} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Book Path</Label>
                      <Input value="Barclays Group:Markets:Equities:Prime:Prime Delta 1:APAC:Delta One Synthetics:Index/Sector/CIB:Delta 1 - Non Index PnL:IS-Taiwan:Conversion - BCSL[15170]" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">L04 Business Area</Label>
                      <Input value="Markets" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">L06 Category</Label>
                      <Input value="Equities" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Named PnL</Label>
                      <Input value="Prime Delta 1" readOnly className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground border-b pb-2">System Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">System</Label>
                      <Input value={exceptionData.system} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Legal Entity</Label>
                      <Input value={exceptionData.legalEntity} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Regulator</Label>
                      <Input value={exceptionData.regulator} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">As of Time</Label>
                      <Input value="2025-09-09 13:40:48" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Processed Exceptions</Label>
                      <Input value="2025-09-10 14:54:00" readOnly className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Instrument Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground border-b pb-2">Instrument Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Instrument ID</Label>
                      <Input value={exceptionData.instrumentId} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Instrument Name</Label>
                      <Input value="00687B.TWO" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Instrument Type</Label>
                      <Input value="SICOVAM" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Equity Class Type</Label>
                      <Input value="Fund (Ex)" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">ESM Security Type</Label>
                      <Input value="ETF" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Position TBBB Classification</Label>
                      <Input value={positionTbbbClassification} readOnly className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Position Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground border-b pb-2">Position Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Position AV</Label>
                      <Input value="1,090,157.60" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Position Qty</Label>
                      <Input value={exceptionData.positionQty.toLocaleString()} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Original Qty</Label>
                      <Input value={exceptionData.originalQty.toLocaleString()} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">BB Underlyings</Label>
                      <Input value="Sophis/131907931/00687B.TWO" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">SOD Delta on BB Underlying</Label>
                      <Input value="1,090,157.60" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Look Through</Label>
                      <Input value="Y" readOnly className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Exception Management */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground border-b pb-2">Exception Management</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Input value={status === "OPEN" ? "Open" : status === "IN PROGRESS" ? "In Progress" : status === "RESOLVED" ? "Resolved" : "Rejected"} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Priority</Label>
                      <Input value="High" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">SLA Status</Label>
                      <Input value="Within SLA" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Aging (Days)</Label>
                      <Input value={exceptionData.aging.toString()} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Assigned To</Label>
                      <Input value="John Smith" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Category ID</Label>
                      <Input value="null" readOnly className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground border-b pb-2">Additional Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Created Date</Label>
                      <Input value="2025-09-09" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Due Date</Label>
                      <Input value="2025-09-12" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Reason</Label>
                      <Textarea value="Position classification mismatch" readOnly className="mt-1" rows={2} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="p-6 pt-4">
            <div className="space-y-6">
              {/* Status and Workflow Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Select Workflow</Label>
                  <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.categoryName}>
                          {category.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Commentary Section */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Commentary</h3>
                
                {/* Add new comment */}
                <div className="mb-4">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-2"
                    rows={3}
                  />
                  <Button onClick={handleAddComment} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>

                {/* Comments list */}
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.commentBy}`}
                            />
                            <AvatarFallback>
                              {comment.commentBy.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{comment.commentBy}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {new Date(comment.commentDate).toLocaleString()}
                          </span>
                        </div>
                        {comment.commentBy === currentUser && (
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingComment(comment.id);
                                setEditCommentText(comment.comments);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {editingComment === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            rows={2}
                          />
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => handleUpdateComment(comment.id)}>
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingComment(null);
                                setEditCommentText("");
                              }}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground">{comment.comments}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="p-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Audit History</h3>
              {auditTrail.map((entry, index) => {
                const previousEntry = index < auditTrail.length - 1 ? auditTrail[index + 1] : undefined;
                const changes = formatAuditChanges(entry, previousEntry);
                
                return (
                  <div key={`${entry.rev}-${index}`} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {entry.revType}
                        </Badge>
                        <span className="text-sm font-medium">Rev {entry.rev}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {entry.asOfTime ? new Date(entry.asOfTime).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      {entry.actions.map((action, actionIndex) => (
                        <p key={actionIndex} className="text-sm text-foreground">{action}</p>
                      ))}
                    </div>

                    {changes && changes.length > 0 && (
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Changes:</p>
                        {changes.map((change, changeIndex) => (
                          <div key={changeIndex} className="text-xs mb-1">
                            <span className="font-medium">{change.field}:</span>
                            <span className="text-red-500 line-through ml-2">
                              {change.oldValue || 'null'}
                            </span>
                            <span className="text-green-500 ml-2">
                              {change.newValue || 'null'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show key data for the revision */}
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {entry.status && (
                        <div>Status: <span className="font-medium">{entry.status}</span></div>
                      )}
                      {entry.aging && (
                        <div>Aging: <span className="font-medium">{entry.aging} days</span></div>
                      )}
                      {entry.positionQty && (
                        <div>Position Qty: <span className="font-medium">{entry.positionQty.toLocaleString()}</span></div>
                      )}
                      {entry.system && (
                        <div>System: <span className="font-medium">{entry.system}</span></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="p-6 pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-foreground">Documents</h3>
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Document</DialogTitle>
                      <DialogDescription>
                        Select a file to upload for this exception.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="file">File</Label>
                        <Input
                          id="file"
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleFileUpload} disabled={!selectedFile}>
                        Upload
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {files.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No documents attached to this exception</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="mr-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {file.filename?.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{file.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded by {file.uploadedBy} on{' '}
                            {file.uploadedDate ? new Date(file.uploadedDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => file.id && handleDeleteFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CardFooter className="border-t p-4 flex justify-end space-x-2 bg-muted/50">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};

export default ExceptionDetails;