import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";

export default function AdminPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Panel</CardTitle>
        <CardDescription>
          System configuration and user management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Admin controls will be displayed here.
        </p>
      </CardContent>
    </Card>
  );
}