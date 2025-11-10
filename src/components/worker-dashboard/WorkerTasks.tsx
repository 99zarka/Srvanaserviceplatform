import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export function WorkerTasks() {
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
        <h1 className="mb-2">My Tasks</h1>
        <p className="text-muted-foreground">Manage your scheduled and active tasks</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
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
                  <TableCell>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
