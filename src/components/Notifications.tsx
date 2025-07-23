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
    &lt;Sheet&gt;
      &lt;SheetTrigger asChild&gt;
        &lt;Button variant="ghost" size="icon"&gt;
          &lt;Bell className="h-5 w-5" /&gt;
          &lt;span className="sr-only"&gt;Notifications&lt;/span&gt;
        &lt;/Button&gt;
      &lt;/SheetTrigger&gt;
      &lt;SheetContent&gt;
        &lt;SheetHeader&gt;
          &lt;SheetTitle&gt;Notifications&lt;/SheetTitle&gt;
          &lt;SheetDescription&gt;
            You have {notifications.length} unread messages.
          &lt;/SheetDescription&gt;
        &lt;/SheetHeader&gt;
        &lt;div className="mt-4"&gt;
          &lt;div className="space-y-4"&gt;
            {notifications.map((notification) =&gt; (
              &lt;div key={notification.id}&gt;
                &lt;div className="mb-2"&gt;
                  &lt;h4 className="font-semibold"&gt;{notification.title}&lt;/h4&gt;
                  &lt;p className="text-sm text-muted-foreground"&gt;
                    {notification.description}
                  &lt;/p&gt;
                  &lt;p className="text-xs text-muted-foreground mt-1"&gt;
                    {notification.timestamp}
                  &lt;/p&gt;
                &lt;/div&gt;
                &lt;Separator /&gt;
              &lt;/div&gt;
            ))}
          &lt;/div&gt;
        &lt;/div&gt;
        &lt;SheetFooter className="mt-4"&gt;
          &lt;Button className="w-full"&gt;Mark all as read&lt;/Button&gt;
        &lt;/SheetFooter&gt;
      &lt;/SheetContent&gt;
    &lt;/Sheet&gt;
  );
}