import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";

export default function ReportsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>
          Standard reports and analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Standard reporting functionality will be displayed here.
        </p>
      </CardContent>
    </Card>
  );
}