import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { LayoutDashboard, Users, Briefcase, FileText, Settings, TrendingUp, UserCheck, AlertCircle, Eye, Check, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Link } from "react-router-dom";
import api from "../../utils/api"; // Import the API utility

export function AdminOverview() {
  const { token } = useSelector((state) => state.auth);
  const [platformStats, setPlatformStats] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      if (!token) {
        setError("المسؤول غير مصادق عليه.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch platform statistics
        const statsData = await api.get("/dashboard/admin/admin-summary/", {
          headers: { Authorization: `Bearer ${token}` },
        }); // Admin summary endpoint
        setPlatformStats([
          { label: "إجمالي المستخدمين", value: statsData.total_users || 0, change: "+12%", icon: Users, color: "text-blue-600" },
          { label: "العمال النشطين", value: statsData.active_workers || 0, change: "+8%", icon: UserCheck, color: "text-green-600" },
          { label: "الخدمات المكتملة", value: statsData.services_completed || 0, change: "+15%", icon: Briefcase, color: "text-purple-600" },
          { label: "إجمالي الإيرادات", value: `${statsData.total_revenue || 0} ر.س`, change: "+22%", icon: TrendingUp, color: "text-primary" },
        ]);

        // Fetch recent users (e.g., last 4 registered)
        const usersData = await api.get("/users/?limit=4&ordering=-date_joined", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersArray = usersData.results || [];
        setRecentUsers(usersArray.map(user => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          type: user.role, // Assuming 'role' field exists
          status: user.is_active ? "نشط" : "غير نشط",
          joinDate: new Date(user.registration_date || user.date_joined).toLocaleDateString("ar-EG"),
        })));

        // Fetch pending worker approvals - using orders as a proxy for now
        const pendingWorkersData = await api.get("/orders/?limit=3&ordering=-created_at", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordersArray = pendingWorkersData.results || [];
        setPendingApprovals(ordersArray.map(order => ({
          id: order.id,
          worker: `${order.client_user?.first_name || "غير معروف"} ${order.client_user?.last_name || "مستخدم"}`,
          service: order.service?.name || "خدمة", 
          submitted: new Date(order.creation_timestamp || order.created_at).toLocaleDateString("ar-EG"),
        })));

      } catch (err) {
        setError(err.message || "فشل في جلب بيانات لوحة تحكم المسؤول.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, [token]);

  const getStatusBadge = (status) => {
    const variants = {
      "نشط": { variant: "default", className: "bg-green-100 text-green-800" },
      "غير نشط": { variant: "default", className: "bg-gray-100 text-gray-800" },
      "معلق": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "Active": { variant: "default", className: "bg-green-100 text-green-800" },
      "Inactive": { variant: "default", className: "bg-gray-100 text-gray-800" },
      "Pending": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
    };
    const config = variants[status] || { variant: "default", className: "bg-gray-100 text-gray-800" };
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    const variants = {
      "عميل": "border-secondary text-secondary",
      "عامل": "border-primary text-primary",
      "مسؤول": "border-red-600 text-red-600",
      "client": "border-secondary text-secondary",
      "worker": "border-primary text-primary",
      "admin": "border-red-600 text-red-600",
    };
    const displayType = type === "worker" ? "عامل" : type === "client" ? "عميل" : type === "admin" ? "مسؤول" : type || "غير محدد";
    const className = variants[displayType] || variants[type?.toLowerCase()] || "border-gray-500 text-gray-500";
    return <Badge variant="outline" className={className}>{displayType}</Badge>;
  };

  if (loading) return <div className="text-center py-20" dir="rtl">جاري تحميل لوحة التحكم...</div>;
  if (error) return <div className="text-center py-20 text-red-500" dir="rtl">خطأ: {error}</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="mb-2">لوحة تحكم المسؤول</h1>
        <p className="text-muted-foreground">مراقبة نشاط المنصة وإدارة العمليات</p>
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
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <p className="text-green-600">{stat.change} عن الشهر الماضي</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span>الطلبات الحديثة</span>
              </CardTitle>
              <Badge className="bg-yellow-100 text-yellow-800">
                {pendingApprovals.length}
              </Badge>
            </div>
            <Button variant="outline" size="sm" asChild className="flex items-center space-x-2">
              <Link to="/dashboard/pending-approvals">
                <Eye className="h-4 w-4" />
                <span>عرض الكل</span>
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم العميل</TableHead>
                <TableHead>الخدمة</TableHead>
                <TableHead>تم التقديم</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApprovals.length > 0 ? (
                pendingApprovals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell>{approval.worker}</TableCell>
                    <TableCell>{approval.service}</TableCell>
                    <TableCell>{approval.submitted}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1">
                          <Check className="h-4 w-4" />
                          <span>مراجعة</span>
                        </Button>
                        <Button size="sm" variant="outline" asChild className="flex items-center space-x-1">
                          <Link to={`/dashboard/orders/${approval.id}`}>
                            <Search className="h-4 w-4" />
                            <span>التفاصيل</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">لا توجد طلبات حديثة.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>تسجيلات المستخدمين الحديثة</span>
            </CardTitle>
            <Button variant="outline" asChild className="flex items-center space-x-2">
              <Link to="/dashboard/users">
                <Users className="h-4 w-4" />
                <span>عرض جميع المستخدمين</span>
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الانضمام</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name || `${user.first_name || ""} ${user.last_name || ""}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getTypeBadge(user.type)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">لا توجد تسجيلات مستخدمين حديثة.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
