import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export function ClientRequests() {
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
        <h1 className="mb-2">My Service Requests</h1>
        <p className="text-muted-foreground">Track and manage all your service requests</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
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
