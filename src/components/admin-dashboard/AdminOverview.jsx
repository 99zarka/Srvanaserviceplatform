import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  UserCheck, 
  AlertCircle, 
  Eye, 
  Check, 
  Search,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Link } from "react-router-dom";
import api from "../../utils/api";

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
          { 
            label: "إجمالي المستخدمين", 
            value: statsData.total_users || 0, 
            change: "+12%", 
            trend: "up",
            icon: Users, 
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
            accentColor: "bg-blue-500"
          },
          { 
            label: "العمال النشطين", 
            value: statsData.active_workers || 0, 
            change: "+8%", 
            trend: "up",
            icon: UserCheck, 
            bgColor: "bg-green-50",
            iconColor: "text-green-600",
            accentColor: "bg-green-500"
          },
          { 
            label: "الخدمات المكتملة", 
            value: statsData.services_completed || 0, 
            change: "+15%", 
            trend: "up",
            icon: Briefcase, 
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
            accentColor: "bg-purple-500"
          },
          {
            label: "إجمالي الإيرادات",
            value: `${statsData.total_revenue || 0} ج.م`,
            change: "+22%",
            trend: "up",
            icon: DollarSign,
            bgColor: "bg-accent-50",
            iconColor: "text-accent-600",
            accentColor: "bg-accent-500"
          },
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
      "نشط": { variant: "default", className: "bg-success/10 text-success border-success/30 font-semibold" },
      "غير نشط": { variant: "default", className: "bg-neutral-100 text-neutral-600 border-neutral-300 font-semibold" },
      "معلق": { variant: "default", className: "bg-warning/10 text-warning border-warning/30 font-semibold" },
      "Active": { variant: "default", className: "bg-success/10 text-success border-success/30 font-semibold" },
      "Inactive": { variant: "default", className: "bg-neutral-100 text-neutral-600 border-neutral-300 font-semibold" },
      "Pending": { variant: "default", className: "bg-warning/10 text-warning border-warning/30 font-semibold" },
    };
    const config = variants[status] || { variant: "default", className: "bg-neutral-100 text-neutral-600 border-neutral-300 font-semibold" };
    return <Badge variant="outline" className={config.className}>{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    const variants = {
      "عميل": { className: "bg-blue-50 border-blue-300 text-blue-700 font-semibold", icon: Users },
      "عامل": { className: "bg-primary/10 border-primary/30 text-primary font-semibold", icon: Briefcase },
      "مسؤول": { className: "bg-danger/10 border-danger/30 text-danger font-semibold", icon: Shield },
      "client": { className: "bg-blue-50 border-blue-300 text-blue-700 font-semibold", icon: Users },
      "worker": { className: "bg-primary/10 border-primary/30 text-primary font-semibold", icon: Briefcase },
      "admin": { className: "bg-danger/10 border-danger/30 text-danger font-semibold", icon: Shield },
    };
    const displayType = type === "worker" ? "عامل" : type === "client" ? "عميل" : type === "admin" ? "مسؤول" : type || "غير محدد";
    const config = variants[displayType] || variants[type?.toLowerCase()] || { className: "bg-neutral-100 border-neutral-300 text-neutral-600 font-semibold" };
    return <Badge variant="outline" className={config.className}>{displayType}</Badge>;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50" dir="rtl">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent mb-4"></div>
        <p className="text-neutral-600 text-lg">جاري تحميل لوحة التحكم...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50" dir="rtl">
      <Card className="max-w-md border-danger">
        <CardContent className="pt-6">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-danger mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-800 mb-2">خطأ في التحميل</h3>
            <p className="text-danger">{error}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 p-6" dir="rtl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-primary rounded-xl">
            <LayoutDashboard className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-primary">لوحة تحكم المسؤول</h1>
            <p className="text-neutral-600 text-lg mt-1">مراقبة نشاط المنصة وإدارة العمليات</p>
          </div>
        </div>
        <div className="h-1 w-32 bg-gradient-to-r from-accent to-accent/30 rounded-full"></div>
      </div>

      {/* Platform Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {platformStats.map((stat, index) => (
          <Card 
            key={stat.label}
            className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            {/* Accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor}`}></div>
            
            <CardContent className="pt-6 pb-6">
              {/* Icon and Value Row */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-neutral-800 mb-1">{stat.value}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-danger" />
                    )}
                    <span className={stat.trend === "up" ? "text-success font-semibold" : "text-danger font-semibold"}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Label */}
              <p className="text-neutral-600 font-medium text-sm">{stat.label}</p>
              <p className="text-neutral-400 text-xs mt-1">مقارنة بالشهر الماضي</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Approvals Section */}
      <Card className="mb-8 border-0 shadow-lg">
        {/* Card Header with Accent */}
        <div className="bg-gradient-to-r from-primary to-primary-600 p-6 rounded-t-xl">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl font-bold">الطلبات الحديثة</CardTitle>
                  <CardDescription className="text-white/80 mt-1">
                    مراجعة وإدارة الطلبات الجديدة
                  </CardDescription>
                </div>
                <Badge className="bg-accent text-neutral-900 font-bold px-3 py-1 mr-3">
                  {pendingApprovals.length}
                </Badge>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                asChild 
                className="bg-white hover:bg-neutral-100 text-primary font-semibold shadow-md"
              >
                <Link to="/dashboard/pending-approvals" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>عرض الكل</span>
                </Link>
              </Button>
            </div>
          </CardHeader>
        </div>
        
        <CardContent className="p-6 bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-neutral-200">
                  <TableHead className="text-neutral-700 font-bold">اسم العميل</TableHead>
                  <TableHead className="text-neutral-700 font-bold">الخدمة</TableHead>
                  <TableHead className="text-neutral-700 font-bold">تم التقديم</TableHead>
                  <TableHead className="text-neutral-700 font-bold text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.length > 0 ? (
                  pendingApprovals.map((approval) => (
                    <TableRow 
                      key={approval.id} 
                      className="hover:bg-neutral-50 transition-colors border-b border-neutral-100"
                    >
                      <TableCell className="font-medium text-neutral-800">{approval.worker}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {approval.service}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-neutral-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-neutral-400" />
                          {approval.submitted}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button 
                            size="sm" 
                            className="bg-success hover:bg-success/90 text-white shadow-sm"
                          >
                            <Check className="h-4 w-4 ml-1" />
                            <span>مراجعة</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            asChild 
                            className="border-primary/30 hover:bg-primary/5"
                          >
                            <Link to={`/dashboard/orders/${approval.id}`} className="flex items-center gap-1">
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
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-neutral-100 rounded-full">
                          <FileText className="h-8 w-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-500 font-medium">لا توجد طلبات حديثة</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Users Section */}
      <Card className="border-0 shadow-lg">
        {/* Card Header with Accent */}
        <div className="bg-gradient-to-r from-primary to-primary-600 p-6 rounded-t-xl">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl font-bold">تسجيلات المستخدمين الحديثة</CardTitle>
                  <CardDescription className="text-white/80 mt-1">
                    آخر المستخدمين المسجلين في المنصة
                  </CardDescription>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                asChild 
                className="bg-white hover:bg-neutral-100 text-primary font-semibold shadow-md"
              >
                <Link to="/dashboard/users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>عرض جميع المستخدمين</span>
                </Link>
              </Button>
            </div>
          </CardHeader>
        </div>
        
        <CardContent className="p-6 bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-neutral-200">
                  <TableHead className="text-neutral-700 font-bold">الاسم</TableHead>
                  <TableHead className="text-neutral-700 font-bold">البريد الإلكتروني</TableHead>
                  <TableHead className="text-neutral-700 font-bold">النوع</TableHead>
                  <TableHead className="text-neutral-700 font-bold">الحالة</TableHead>
                  <TableHead className="text-neutral-700 font-bold">تاريخ الانضمام</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <TableRow 
                      key={user.id}
                      className="hover:bg-neutral-50 transition-colors border-b border-neutral-100"
                    >
                      <TableCell className="font-medium text-neutral-800">
                        {user.name || `${user.first_name || ""} ${user.last_name || ""}`}
                      </TableCell>
                      <TableCell className="text-neutral-600">{user.email}</TableCell>
                      <TableCell>{getTypeBadge(user.type)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-neutral-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-neutral-400" />
                          {user.joinDate}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-neutral-100 rounded-full">
                          <Users className="h-8 w-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-500 font-medium">لا توجد تسجيلات مستخدمين حديثة</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
