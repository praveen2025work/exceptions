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
import { Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const notifications = [
  {
    id: 1,
    title: "New exception assigned",
    description: "Exception EX-001 has been assigned to you.",
    timestamp: "5 minutes ago",
  },
  {
    id: 2,
    title: "SLA Breach Warning",
    description: "Exception EX-003 is approaching its SLA.",
    timestamp: "1 hour ago",
  },
  {
    id: 3,
    title: "Workflow step completed",
    description: "Step 2 for exception EX-002 has been completed by John Doe.",
    timestamp: "3 hours ago",
  },
  {
    id: 4,
    title: "New comment on EX-001",
    description: "Jane Smith left a comment on exception EX-001.",
    timestamp: "1 day ago",
  },
];

export function Notifications() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            You have {notifications.length} unread messages.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id}>
                <div className="mb-2">
                  <h4 className="font-semibold">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.timestamp}
                  </p>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        </div>
        <SheetFooter className="mt-4">
          <Button className="w-full">Mark all as read</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}