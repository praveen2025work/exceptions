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
  Activity,
  Info,
  History,
  Paperclip,
  FileText,
  Zap,
  Target,
  Calendar,
  Building,
  Settings,
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
import { ScrollArea } from "./ui/scroll-area";
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
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [currentUser] = useState("Alice"); // Mock current user
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
          commentBy: "Alice",
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
      setShowCommentSection(false); // Hide comment input section after adding
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
        return "destructive";
      case "IN PROGRESS":
        return "secondary";
      case "RESOLVED":
        return "default";
      case "REJECTED":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertCircle className="h-4 w-4" />;
      case "IN PROGRESS":
        return <Clock className="h-4 w-4" />;
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800";
      case "Low":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800";
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

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'details': return <Activity className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      case 'audit': return <History className="h-4 w-4" />;
      case 'documents': return <Paperclip className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-0 shadow-2xl">
      {/* Compact Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"></div>
        <div className="relative px-4 py-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-1 rounded bg-primary/10 flex-shrink-0">
                <Settings className="h-3 w-3 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-semibold text-foreground">Exception Details</h2>
                  <span className="text-xs text-muted-foreground">
                    {exceptionData.instrumentId} • {exceptionData.legalEntity}
                  </span>
                  <Badge variant="outline" className="text-xs font-mono px-1.5 py-0.5 h-5">
                    #{exceptionId.split('_')[0]}...
                  </Badge>
                  <Badge variant={getStatusBadgeColor(status)} className="flex items-center gap-1 px-1.5 py-0.5 h-5">
                    {getStatusIcon(status)}
                    <span className="font-medium text-xs">
                      {status === "OPEN" ? "Open" : status === "IN PROGRESS" ? "In Progress" : status === "RESOLVED" ? "Resolved" : "Rejected"}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0 h-7 w-7 p-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Tabs - Reduced padding */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 pt-3">
            <TabsList className="grid w-full grid-cols-4 bg-muted/30 p-1 rounded-xl border border-border/50">
              <TabsTrigger 
                value="details" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                {getTabIcon('details')}
                <span className="font-medium">Details</span>
              </TabsTrigger>
              <TabsTrigger 
                value="info" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                {getTabIcon('info')}
                <span className="font-medium">Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="audit" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                {getTabIcon('audit')}
                <span className="font-medium">Audit</span>
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                {getTabIcon('documents')}
                <span className="font-medium">Files</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-4 pb-4">
            <TabsContent value="details" className="mt-4 space-y-4">
              {/* Status and Workflow Section - Optimized width usage */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs font-medium text-foreground mb-1">
                        Status
                      </Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="bg-background/50 border-border/50 h-7 text-xs">
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
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs font-medium text-foreground mb-1">
                        Workflow
                      </Label>
                      <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                        <SelectTrigger className="bg-background/50 border-border/50 h-7 text-xs">
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
                </CardContent>
              </Card>

              {/* Commentary Section - Show existing comments by default, hide input box */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {/* Add Comment Section - Progressive disclosure */}
                    {!showCommentSection ? (
                      <Button 
                        onClick={() => setShowCommentSection(true)} 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Add Comment
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Add your insights, observations, or next steps..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="bg-background/50 border-border/50 resize-none min-h-[80px] text-sm"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleAddComment} size="sm" className="flex-1">
                            <Plus className="h-3 w-3 mr-1" />
                            Add Comment
                          </Button>
                          <Button 
                            onClick={() => {
                              setShowCommentSection(false);
                              setNewComment("");
                            }} 
                            variant="outline" 
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Comments list - Always visible if comments exist */}
                    {comments.length > 0 && (
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-muted/30 border border-border/30 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.commentBy}`}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {comment.commentBy.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="text-xs font-medium text-foreground">{comment.commentBy}</span>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-2 w-2" />
                                    {new Date(comment.commentDate).toLocaleString()}
                                  </p>
                                </div>
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
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-2.5 w-2.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            {editingComment === comment.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editCommentText}
                                  onChange={(e) => setEditCommentText(e.target.value)}
                                  className="bg-background/50 text-sm"
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
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-foreground bg-background/30 p-2 rounded border border-border/20">
                                {comment.comments}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="mt-4">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Info className="h-3 w-3 text-primary" />
                    </div>
                    Complete Exception Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Business Information */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                        <Building className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">Business Information</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Exception ID</Label>
                          <Input value={exceptionData.id} readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Book Code</Label>
                          <Input value={exceptionData.bookCode} readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Book Path</Label>
                          <Input value="Barclays Group:Markets:Equities:Prime:Prime Delta 1:APAC:Delta One Synthetics:Index/Sector/CIB:Delta 1 - Non Index PnL:IS-Taiwan:Conversion - BCSL[15170]" readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">L04 Business Area</Label>
                          <Input value="Markets" readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">L06 Category</Label>
                          <Input value="Equities" readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Named PnL</Label>
                          <Input value="Prime Delta 1" readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                      </div>
                    </div>

                    {/* System Information */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                        <Settings className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">System Information</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">System</Label>
                          <Input value={exceptionData.system} readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Legal Entity</Label>
                          <Input value={exceptionData.legalEntity} readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Regulator</Label>
                          <Input value={exceptionData.regulator} readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">As of Time</Label>
                          <Input value="2025-09-09 13:40:48" readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Processed Exceptions</Label>
                          <Input value="2025-09-10 14:54:00" readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Instrument Information */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                        <FileText className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">Instrument Information</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Instrument ID</Label>
                          <Input value={exceptionData.instrumentId} readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Instrument Name</Label>
                          <Input value="00687B.TWO" readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Instrument Type</Label>
                          <Input value="SICOVAM" readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Equity Class Type</Label>
                          <Input value="Fund (Ex)" readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">ESM Security Type</Label>
                          <Input value="ETF" readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Position TBBB Classification</Label>
                          <Input value={positionTbbbClassification} readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Position Information */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                        <Target className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">Position Information</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Position AV</Label>
                          <Input value="1,090,157.60" readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Position Qty</Label>
                          <Input value={exceptionData.positionQty.toLocaleString()} readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Original Qty</Label>
                          <Input value={exceptionData.originalQty.toLocaleString()} readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">BB Underlyings</Label>
                          <Input value="Sophis/131907931/00687B.TWO" readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">SOD Delta on BB Underlying</Label>
                          <Input value="1,090,157.60" readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Look Through</Label>
                          <Input value="Y" readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Exception Management */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                        <Activity className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">Exception Management</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <Input value={status === "OPEN" ? "Open" : status === "IN PROGRESS" ? "In Progress" : status === "RESOLVED" ? "Resolved" : "Rejected"} readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Priority</Label>
                          <Input value="High" readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">SLA Status</Label>
                          <Input value="Within SLA" readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Aging (Days)</Label>
                          <Input value={exceptionData.aging.toString()} readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Assigned To</Label>
                          <Input value="John Smith" readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Category ID</Label>
                          <Input value="null" readOnly className="mt-1 bg-muted/20 text-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                        <Calendar className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">Additional Information</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Created Date</Label>
                          <Input value="2025-09-09" readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Due Date</Label>
                          <Input value="2025-09-12" readOnly className="mt-1 bg-muted/20 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Reason</Label>
                          <Textarea value="Position classification mismatch" readOnly className="mt-1 bg-muted/20 text-xs" rows={2} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="mt-4">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <History className="h-3 w-3 text-primary" />
                    </div>
                    Audit History & Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditTrail.map((entry, index) => {
                      const previousEntry = index < auditTrail.length - 1 ? auditTrail[index + 1] : undefined;
                      const changes = formatAuditChanges(entry, previousEntry);
                      
                      return (
                        <div key={`${entry.rev}-${index}`} className="relative">
                          {index !== auditTrail.length - 1 && (
                            <div className="absolute left-6 top-12 bottom-0 w-px bg-border/50"></div>
                          )}
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                              <Activity className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {entry.revType}
                                </Badge>
                                <span className="text-sm font-medium text-foreground">Rev {entry.rev}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {entry.asOfTime ? new Date(entry.asOfTime).toLocaleString() : 'N/A'}
                                </span>
                              </div>
                              
                              <div className="mb-3">
                                {entry.actions.map((action, actionIndex) => (
                                  <p key={actionIndex} className="text-sm text-foreground bg-muted/20 p-2 rounded border border-border/20">
                                    {action}
                                  </p>
                                ))}
                              </div>

                              {changes && changes.length > 0 && (
                                <div className="bg-muted/30 p-3 rounded-lg border border-border/30">
                                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    Changes:
                                  </p>
                                  {changes.map((change, changeIndex) => (
                                    <div key={changeIndex} className="text-xs mb-1 font-mono">
                                      <span className="font-medium text-foreground">{change.field}:</span>
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
                              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                                {entry.status && (
                                  <div>Status: <span className="font-medium text-foreground">{entry.status}</span></div>
                                )}
                                {entry.aging && (
                                  <div>Aging: <span className="font-medium text-foreground">{entry.aging} days</span></div>
                                )}
                                {entry.positionQty && (
                                  <div>Position Qty: <span className="font-medium text-foreground">{entry.positionQty.toLocaleString()}</span></div>
                                )}
                                {entry.system && (
                                  <div>System: <span className="font-medium text-foreground">{entry.system}</span></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Paperclip className="h-3 w-3 text-primary" />
                      </div>
                      Document Management
                    </CardTitle>
                    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="shadow-sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Upload Document
                          </DialogTitle>
                          <DialogDescription>
                            Select a file to upload for this exception. Supported formats: PDF, DOC, XLS, TXT, PNG, JPG.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="file" className="text-sm font-medium">File</Label>
                            <Input
                              id="file"
                              type="file"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                              className="mt-1"
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
                </CardHeader>
                <CardContent className="space-y-4">
                  {files.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">No documents attached to this exception</p>
                      <p className="text-muted-foreground text-xs mt-1">Upload files to keep track of supporting documents</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 bg-muted/20 border border-border/30 rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {file.filename?.split('.').pop()?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{file.filename}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <User className="h-3 w-3" />
                                Uploaded by {file.uploadedBy}
                                <Calendar className="h-3 w-3 ml-2" />
                                {file.uploadedDate ? new Date(file.uploadedDate).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => file.id && handleDeleteFile(file.id)}
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Modern Footer - Reduced padding */}
      <div className="p-4 border-t border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1 shadow-sm h-8">
            <Save className="h-3 w-3 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={onClose} className="bg-background/50 h-8">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExceptionDetails;