import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Clock, CheckCircle, XCircle, MessageSquare, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Generate exception-related notifications based on actual exception data
const generateExceptionNotifications = () => {
  const notifications = [
    {
      id: 1,
      type: "sla_breach",
      title: "SLA Breach Alert",
      description: "Exception 1020134_131907934_FUTURE (WTI_DEC25) has breached its SLA deadline. Assigned to Frank Miller.",
      exceptionId: "1020134_131907934_FUTURE",
      instrumentName: "WTI_DEC25",
      priority: "Critical",
      timestamp: "2 hours ago",
      icon: AlertTriangle,
      color: "destructive"
    },
    {
      id: 2,
      type: "sla_warning",
      title: "SLA Warning",
      description: "Exception 1020146_131907946_SICOVAM (CORP_CDS_5Y) is approaching its SLA deadline. Due in 4 hours.",
      exceptionId: "1020146_131907946_SICOVAM",
      instrumentName: "CORP_CDS_5Y",
      priority: "Critical",
      timestamp: "30 minutes ago",
      icon: Clock,
      color: "warning"
    },
    {
      id: 3,
      type: "assignment",
      title: "New Exception Assigned",
      description: "Exception 1020129_131907931_SICOVAM (00687B.TWO) has been assigned to you for review.",
      exceptionId: "1020129_131907931_SICOVAM",
      instrumentName: "00687B.TWO",
      priority: "High",
      timestamp: "1 hour ago",
      icon: User,
      color: "default"
    },
    {
      id: 4,
      type: "status_change",
      title: "Exception Resolved",
      description: "Exception 1020131_214194618_SICOVAM (CORP_BOND_001) has been marked as Resolved by Carol Davis.",
      exceptionId: "1020131_214194618_SICOVAM",
      instrumentName: "CORP_BOND_001",
      priority: "Low",
      timestamp: "3 hours ago",
      icon: CheckCircle,
      color: "success"
    },
    {
      id: 5,
      type: "status_change",
      title: "Exception Rejected",
      description: "Exception 1020132_131907932_SICOVAM (USD_IRS_5Y) has been rejected. Reason: System migration data validation failed.",
      exceptionId: "1020132_131907932_SICOVAM",
      instrumentName: "USD_IRS_5Y",
      priority: "Medium",
      timestamp: "5 hours ago",
      icon: XCircle,
      color: "destructive"
    },
    {
      id: 6,
      type: "comment",
      title: "New Comment Added",
      description: "Alice Johnson added a comment to exception 1020129_131907931_SICOVAM: 'Position classification requires additional review.'",
      exceptionId: "1020129_131907931_SICOVAM",
      instrumentName: "00687B.TWO",
      priority: "High",
      timestamp: "6 hours ago",
      icon: MessageSquare,
      color: "default"
    },
    {
      id: 7,
      type: "high_priority",
      title: "High Priority Exception",
      description: "Critical exception 1020141_131907941_SICOVAM (HY_CORP_BOND_001) requires immediate attention. High yield bond rating change detected.",
      exceptionId: "1020141_131907941_SICOVAM",
      instrumentName: "HY_CORP_BOND_001",
      priority: "High",
      timestamp: "8 hours ago",
      icon: AlertTriangle,
      color: "warning"
    },
    {
      id: 8,
      type: "aging",
      title: "Exception Aging Alert",
      description: "Exception 1020152_131907952_SICOVAM (NATGAS_JAN26) has been open for 22 days. Natural gas storage capacity issue pending resolution.",
      exceptionId: "1020152_131907952_SICOVAM",
      instrumentName: "NATGAS_JAN26",
      priority: "Critical",
      timestamp: "12 hours ago",
      icon: Clock,
      color: "warning"
    }
  ];

  return notifications;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'High':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getTypeColor = (color: string) => {
  switch (color) {
    case 'destructive':
      return 'text-red-500';
    case 'warning':
      return 'text-yellow-500';
    case 'success':
      return 'text-green-500';
    default:
      return 'text-blue-500';
  }
};

export function Notifications() {
  const notifications = generateExceptionNotifications();
  const unreadCount = notifications.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Exception Notifications</SheetTitle>
          <SheetDescription>
            You have {unreadCount} unread exception notifications.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-4">
            {notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div key={notification.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${getTypeColor(notification.color)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <Badge className={getPriorityColor(notification.priority)} variant="secondary">
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {notification.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground">
                          {notification.exceptionId.split('_')[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <SheetFooter className="mt-4 pt-4 border-t">
          <Button className="w-full" variant="outline">
            Mark all as read
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}