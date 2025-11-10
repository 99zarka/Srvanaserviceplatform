import { Home, CreditCard, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Link } from "react-router-dom";

export function ClientOverview() {
  const stats = [
    { label: "Active Requests", value: "3", icon: Clock, color: "text-primary" },
    { label: "Completed", value: "12", icon: CheckCircle, color: "text-green-600" },
    { label: "Total Spent", value: "$2,450", icon: CreditCard, color: "text-blue-600" },
  ];

  const recentRequests = [
    { id: 1, service: "Carpentry", worker: "John Smith", status: "In Progress", date: "Nov 4, 2025", amount: "$450" },
    { id: 2, service: "Plumbing", worker: "Sarah Johnson", status: "Completed", date: "Nov 1, 2025", amount: "$280" },
    { id: 3, service: "Electrical", worker: "Mike Chen", status: "In Progress", date: "Oct 30, 2025", amount: "$520" },
    { id: 4, service: "Painting", worker: "Emily Davis", status: "Pending", date: "Oct 28, 2025", amount: "$380" },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      "In Progress": { variant: "default" as const, className: "bg-blue-100 text-blue-800" },
      "Completed": { variant: "default" as const, className: "bg-green-100 text-green-800" },
      "Pending": { variant: "default" as const, className: "bg-yellow-100 text-yellow-800" },
      "Cancelled": { variant: "default" as const, className: "bg-red-100 text-red-800" },
    };
    const config = variants[status] || variants["Pending"];
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your requests.</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">{stat.label}</p>
                  <div className={stat.color}>{stat.value}</div>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Service Requests</CardTitle>
            <Button variant="outline" asChild>
              <Link to="/client-dashboard/requests">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.service}</TableCell>
                  <TableCell>{request.worker}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{request.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              asChild
            >
              <Link to="/services">Request New Service</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/client-dashboard/messages">View Messages</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
