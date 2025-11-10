import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export function AdminUsers() {
  const recentUsers = [
    { id: 1, name: "John Smith", email: "john@example.com", type: "Worker", status: "Active", joinDate: "Nov 5, 2025" },
    { id: 2, name: "Sarah Wilson", email: "sarah@example.com", type: "Client", status: "Active", joinDate: "Nov 5, 2025" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", type: "Worker", status: "Pending", joinDate: "Nov 4, 2025" },
    { id: 4, name: "Emma Davis", email: "emma@example.com", type: "Client", status: "Active", joinDate: "Nov 4, 2025" },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      "Active": { variant: "default", className: "bg-green-100 text-green-800" },
      "Pending": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "Inactive": { variant: "default", className: "bg-gray-100 text-gray-800" },
    };
    const config = variants[status] || variants["Pending"];
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    return (
      <Badge variant="outline" className={type === "Worker" ? "border-primary text-primary" : "border-secondary text-secondary"}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage all platform users</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Add New User
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getTypeBadge(user.type)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
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
