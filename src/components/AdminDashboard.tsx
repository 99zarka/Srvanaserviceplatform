import { useState } from "react";
import { LayoutDashboard, Users, Briefcase, FileText, Settings, TrendingUp, UserCheck, AlertCircle } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Link } from "react-router-dom";

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin-dashboard" },
    { icon: Users, label: "Users", path: "/admin-dashboard/users" },
    { icon: Briefcase, label: "Services", path: "/admin-dashboard/services" },
    { icon: FileText, label: "Reports", path: "/admin-dashboard/reports" },
    { icon: Settings, label: "Settings", path: "/admin-dashboard/settings" },
  ];

  const platformStats = [
    { label: "Total Users", value: "10,234", change: "+12%", icon: Users, color: "text-blue-600" },
    { label: "Active Workers", value: "2,567", change: "+8%", icon: UserCheck, color: "text-green-600" },
    { label: "Services Completed", value: "52,389", change: "+15%", icon: Briefcase, color: "text-purple-600" },
    { label: "Total Revenue", value: "$245,890", change: "+22%", icon: TrendingUp, color: "text-primary" },
  ];

  const recentUsers = [
    { id: 1, name: "John Smith", email: "john@example.com", type: "Worker", status: "Active", joinDate: "Nov 5, 2025" },
    { id: 2, name: "Sarah Wilson", email: "sarah@example.com", type: "Client", status: "Active", joinDate: "Nov 5, 2025" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", type: "Worker", status: "Pending", joinDate: "Nov 4, 2025" },
    { id: 4, name: "Emma Davis", email: "emma@example.com", type: "Client", status: "Active", joinDate: "Nov 4, 2025" },
  ];

  const pendingApprovals = [
    { id: 1, worker: "David Martinez", service: "Plumbing", submitted: "Nov 5, 2025" },
    { id: 2, worker: "Lisa Anderson", service: "Painting", submitted: "Nov 5, 2025" },
    { id: 3, worker: "Tom Harris", service: "Electrical", submitted: "Nov 4, 2025" },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      "Active": { variant: "default" as const, className: "bg-green-100 text-green-800" },
      "Pending": { variant: "default" as const, className: "bg-yellow-100 text-yellow-800" },
      "Inactive": { variant: "default" as const, className: "bg-gray-100 text-gray-800" },
    };
    const config = variants[status] || variants["Pending"];
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant="outline" className={type === "Worker" ? "border-primary text-primary" : "border-secondary text-secondary"}>
        {type}
      </Badge>
    );
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userName="Admin User"
      userRole="Administrator"
    >
      {activeSection === "overview" && (
        <div className="space-y-6">
          <div>
            <h1 className="mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor platform activity and manage operations</p>
          </div>

          {/* Platform Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-muted-foreground">{stat.label}</p>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="mb-1">{stat.value}</div>
                  <p className="text-green-600">{stat.change} from last month</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle>Pending Worker Approvals</CardTitle>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {pendingApprovals.length}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin-dashboard/approvals">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker Name</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>{approval.worker}</TableCell>
                      <TableCell>{approval.service}</TableCell>
                      <TableCell>{approval.submitted}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent User Registrations</CardTitle>
                <Button variant="outline" asChild>
                  <Link to="/admin-dashboard/users">View All Users</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === "users" && (
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
      )}

      {activeSection === "services" && (
        <div className="space-y-6">
          <div>
            <h1 className="mb-2">Service Management</h1>
            <p className="text-muted-foreground">Manage service categories and listings</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                Service management interface coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === "reports" && (
        <div className="space-y-6">
          <div>
            <h1 className="mb-2">Reports & Analytics</h1>
            <p className="text-muted-foreground">View platform performance and analytics</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                Analytics dashboard coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === "settings" && (
        <div className="space-y-6">
          <div>
            <h1 className="mb-2">Platform Settings</h1>
            <p className="text-muted-foreground">Configure platform settings and preferences</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                Settings panel coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
