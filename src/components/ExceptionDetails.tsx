import React, { useState } from "react";
import {
  X,
  Save,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface AuditEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  previousValue?: string;
  newValue?: string;
}

interface ExceptionDetailsProps {
  exceptionId?: string;
  onClose?: () => void;
  onSave?: (data: any) => void;
}

const ExceptionDetails = ({
  exceptionId = "1234",
  onClose = () => {},
  onSave = () => {},
}: ExceptionDetailsProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [status, setStatus] = useState("open");
  const [assignee, setAssignee] = useState("unassigned");

  // Mock data for the exception
  const exceptionData = {
    id: exceptionId,
    title: "Position Limit Breach",
    description: "The position exceeds the regulatory limit by 15%",
    instrumentId: "INST-789",
    bookCode: "BC-456",
    classification: "Regulatory",
    createdDate: new Date("2023-05-15T10:30:00"),
    daysOpen: 3,
    slaStatus: "Within SLA",
    priority: "High",
    system: "COMPASS",
    legalEntity: "BBPLC",
    regulator: "FRB",
  };

  // Mock audit history
  const auditHistory: AuditEntry[] = [
    {
      id: "1",
      timestamp: new Date("2023-05-15T10:30:00"),
      user: "system",
      action: "Exception created",
    },
    {
      id: "2",
      timestamp: new Date("2023-05-15T14:45:00"),
      user: "john.doe",
      action: "Status changed",
      previousValue: "New",
      newValue: "In Progress",
    },
    {
      id: "3",
      timestamp: new Date("2023-05-16T09:15:00"),
      user: "jane.smith",
      action: "Comment added",
      newValue: "Investigating the root cause",
    },
    {
      id: "4",
      timestamp: new Date("2023-05-17T11:20:00"),
      user: "john.doe",
      action: "Status changed",
      previousValue: "In Progress",
      newValue: "Open",
    },
  ];

  const handleSave = () => {
    // Prepare data to save
    const updatedData = {
      ...exceptionData,
      status,
      assignee,
    };
    onSave(updatedData);
    // In a real app, we might close the panel after saving
    // onClose();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "in progress":
        return "bg-blue-500 hover:bg-blue-600";
      case "resolved":
        return "bg-green-500 hover:bg-green-600";
      case "closed":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Card className="w-full h-full overflow-hidden flex flex-col bg-white">
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">Audit History</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="p-6 pt-4">
            <div className="space-y-4">
              {/* Status and Priority Section */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Priority</p>
                  <Badge className="bg-red-500 hover:bg-red-600">
                    {exceptionData.priority}
                  </Badge>
                </div>
              </div>

              {/* Title and Description */}
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Title</p>
                  <Input defaultValue={exceptionData.title} className="mt-1" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Description
                  </p>
                  <Textarea
                    defaultValue={exceptionData.description}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>

              {/* Key Details */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger className="py-2">
                    Key Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Instrument ID
                        </p>
                        <p className="text-sm">{exceptionData.instrumentId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Book Code
                        </p>
                        <p className="text-sm">{exceptionData.bookCode}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Classification
                        </p>
                        <p className="text-sm">
                          {exceptionData.classification}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          System
                        </p>
                        <p className="text-sm">{exceptionData.system}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Legal Entity
                        </p>
                        <p className="text-sm">{exceptionData.legalEntity}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Regulator
                        </p>
                        <p className="text-sm">{exceptionData.regulator}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* SLA Information */}
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">SLA Status</span>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    {exceptionData.slaStatus}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Days Open</span>
                  <span className="text-sm font-medium">
                    {exceptionData.daysOpen} days
                  </span>
                </div>
              </div>

              {/* Assignment Section */}
              <div>
                <p className="text-sm font-medium text-gray-500">Assigned To</p>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="john.doe">John Doe</SelectItem>
                    <SelectItem value="jane.smith">Jane Smith</SelectItem>
                    <SelectItem value="alex.johnson">Alex Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Comments Section */}
              <div>
                <p className="text-sm font-medium text-gray-500">Add Comment</p>
                <Textarea
                  placeholder="Enter your comment here..."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-6 pt-4">
            <div className="space-y-4">
              {auditHistory.map((entry) => (
                <div key={entry.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.user}`}
                        />
                        <AvatarFallback>
                          {entry.user.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{entry.user}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {entry.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{entry.action}</p>
                  {entry.previousValue && entry.newValue && (
                    <div className="mt-1 text-xs">
                      <span className="text-red-500 line-through mr-2">
                        {entry.previousValue}
                      </span>
                      <span className="text-green-500">{entry.newValue}</span>
                    </div>
                  )}
                  {!entry.previousValue && entry.newValue && (
                    <p className="mt-1 text-xs text-gray-600">
                      {entry.newValue}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="p-6 pt-4">
            <div className="text-center py-8">
              <p className="text-gray-500">
                No documents attached to this exception
              </p>
              <Button variant="outline" className="mt-4">
                Upload Document
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CardFooter className="border-t p-4 flex justify-end space-x-2 bg-gray-50">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};

export default ExceptionDetails;
