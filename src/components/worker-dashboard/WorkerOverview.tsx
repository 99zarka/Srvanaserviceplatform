import { Home, Briefcase, DollarSign, Star, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Link } from "react-router-dom";

export function WorkerOverview() {
  const stats = [
    { label: "Active Tasks", value: "5", icon: Clock, color: "text-primary" },
    { label: "Completed Tasks", value: "87", icon: CheckCircle, color: "text-green-600" },
    { label: "Total Earnings", value: "$12,450", icon: DollarSign, color: "text-blue-600" },
    { label: "Rating", value: "4.9/5", icon: Star, color: "text-yellow-600" },
  ];

  const activeTasks = [
    { id: 1, client: "Sarah Williams", service: "Carpentry", location: "123 Oak St", date: "Nov 6, 2025", amount: "$450", status: "Scheduled" },
    { id: 2, client: "Michael Brown", service: "Carpentry", location: "456 Pine Ave", date: "Nov 7, 2025", amount: "$320", status: "In Progress" },
    { id: 3, client: "Emma Davis", service: "Carpentry", location: "789 Maple Dr", date: "Nov 8, 2025", amount: "$580", status: "Scheduled" },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      "Scheduled": { variant: "default" as const, className: "bg-blue-100 text-blue-800" },
      "In Progress": { variant: "default" as const, className: "bg-yellow-100 text-yellow-800" },
      "Completed": { variant: "default" as const, className: "bg-green-100 text-green-800" },
    };
    const config = variants[status] || variants["Scheduled"];
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Worker Dashboard</h1>
        <p className="text-muted-foreground">Track your tasks, earnings, and performance</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Active Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Tasks</CardTitle>
            <Button variant="outline" asChild>
              <Link to="/worker-dashboard/tasks">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.client}</TableCell>
                  <TableCell>{task.service}</TableCell>
                  <TableCell>{task.location}</TableCell>
                  <TableCell>{task.date}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{task.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed Tasks</span>
                <span>14</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Earnings</span>
                <span className="text-green-600">$3,420</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg. Rating</span>
                <span className="text-yellow-600">4.9 ⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Update Availability
              </Button>
              <Button variant="outline" className="w-full">
                View Payment History
              </Button>
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
