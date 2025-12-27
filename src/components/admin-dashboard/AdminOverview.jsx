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
  XCircle,
  Flag,
  Shield
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
            change: statsData.change_data?.total_users_change || "0.0%", 
            trend: (statsData.change_data?.total_users_change || "0.0%").startsWith('+') ? "up" : "down",
            icon: Users, 
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
            accentColor: "bg-blue-500"
          },
          { 
            label: "العمال النشطين", 
            value: statsData.active_workers || 0, 
            change: statsData.change_data?.active_workers_change || "0.0%", 
            trend: (statsData.change_data?.active_workers_change || "0.0%").startsWith('+') ? "up" : "down",
            icon: UserCheck, 
            bgColor: "bg-green-50",
            iconColor: "text-green-600",
            accentColor: "bg-green-500"
          },
          { 
            label: "الخدمات المكتملة", 
            value: statsData.services_completed || 0, 
            change: statsData.change_data?.services_completed_change || "0.0%", 
            trend: (statsData.change_data?.services_completed_change || "0.0%").startsWith('+') ? "up" : "down",
            icon: Briefcase, 
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
            accentColor: "bg-purple-500"
          },
          {
            label: "إجمالي الإيرادات",
            value: `${statsData.total_revenue || 0} ج.م`,
            change: statsData.change_data?.total_revenue_change || "0.0%",
            trend: (statsData.change_data?.total_revenue_change || "0.0%").startsWith('+') ? "up" : "down",
            icon: DollarSign,
            bgColor: "bg-accent-50",
            iconColor: "text-accent-600",
            accentColor: "bg-accent-500"
          },
        ]);

        // Fetch recent users (e.g., last 4 registered)
        const usersData = await api.get("/users/users/?page_size=4&ordering=-date_joined", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersArray = usersData.results || [];
        setRecentUsers(usersArray);

        // Fetch recent orders
        const ordersData = await api.get("/orders/?page_size=3&ordering=-creation_timestamp", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordersArray = ordersData.results || [];
        setPendingApprovals(ordersArray.map(order => ({
          id: order.order_id,
          clientId: order.client_user?.user_id,
          worker: `${order.client_user?.first_name || "غير معروف"} ${order.client_user?.last_name || "مستخدم"}`,
          service: order.service?.arabic_name || order.service?.service_name || "خدمة غير محددة",
          submitted: new Date(order.creation_timestamp).toLocaleDateString("ar-EG"),
          status: order.order_status,
          location: order.requested_location,
          problem: order.problem_description
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
    // Backend returns 'technician', 'client', 'admin'
    const typeMap = {
      "technician": "فني",
      "client": "عميل",
      "admin": "مدير"
    };
    const displayType = typeMap[type] || "عميل";
    return (
      <Badge variant="outline" className={type === "technician" ? "border-primary text-primary" : type === "admin" ? "border-destructive text-destructive" : "border-secondary text-secondary"}>
        {displayType}
      </Badge>
    );
  };

  const getOrderStatusBadge = (status) => {
    const statusMap = {
      "OPEN": "مفتوحة",
      "PENDING": "معلقة",
      "ACCEPTED": "مقبولة",
      "IN_PROGRESS": "قيد التنفيذ",
      "AWAITING_RELEASE": "بانتظار الإفراج",
      "COMPLETED": "مكتملة",
      "DISPUTED": "متنازع عليها",
      "CANCELLED": "ملغاة",
      "REFUNDED": "مستردة",
      "AWAITING_TECHNICIAN_RESPONSE": "في انتظار رد الفني",
      "AWAITING_CLIENT_ESCROW_CONFIRMATION": "بانتظار تأكيد العميل للدفع"
    };
    const displayStatus = statusMap[status] || status;
    const colorClasses = {
      "OPEN": "border-blue-300 text-blue-700 bg-blue-50",
      "PENDING": "border-yellow-300 text-yellow-700 bg-yellow-50",
      "ACCEPTED": "border-green-300 text-green-700 bg-green-50",
      "IN_PROGRESS": "border-orange-300 text-orange-700 bg-orange-50",
      "AWAITING_RELEASE": "border-cyan-300 text-cyan-700 bg-cyan-50",
      "COMPLETED": "border-green-300 text-green-700 bg-green-50",
      "DISPUTED": "border-purple-300 text-purple-700 bg-purple-50",
      "CANCELLED": "border-red-300 text-red-700 bg-red-50",
      "REFUNDED": "border-gray-300 text-gray-700 bg-gray-50",
      "AWAITING_TECHNICIAN_RESPONSE": "border-amber-300 text-amber-700 bg-amber-50",
      "AWAITING_CLIENT_ESCROW_CONFIRMATION": "border-cyan-300 text-cyan-700 bg-cyan-50"
    };
    return (
      <Badge variant="outline" className={colorClasses[status] || "border-gray-300 text-gray-700 bg-gray-50"}>
        {displayStatus}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
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
            <h1 className="text-4xl font-extrabold text-secondary">لوحة تحكم المسؤول</h1>
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
        <div className="bg-secondary p-6 rounded-t-xl">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl font-bold">الطلبات الحديثة</CardTitle>
                  <CardDescription className="text-white/80 mt-1">
                    مراجعة وإدارة الطلبات الجديدة
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                asChild
                className="bg-white hover:bg-neutral-100 text-primary font-semibold shadow-md"
              >
                <Link to="/dashboard/orders" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>عرض جميع المشاريع</span>
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
                  <TableHead className="text-neutral-700 font-bold">الحالة</TableHead>
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
                      <TableCell className="font-medium text-neutral-800">
                        {approval.clientId ? (
                          <Link
                            to={`/profile/${approval.clientId}`}
                            className="text-secondary hover:underline"
                          >
                            {approval.worker}
                          </Link>
                        ) : (
                          approval.worker
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {approval.service}
                        </Badge>
                      </TableCell>
                      <TableCell>{getOrderStatusBadge(approval.status)}</TableCell>
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
                            variant="outline"
                            asChild
                            className="border-primary/30 hover:bg-primary/5"
                          >
                            <Link to={`/dashboard/orders-offers/view/${approval.id}`} className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>عرض</span>
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="border-secondary/30 hover:bg-secondary/5"
                          >
                            <Link to={`/dashboard/orders-offers/edit/${approval.id}`} className="flex items-center gap-1">
                              <Search className="h-4 w-4" />
                              <span>تعديل</span>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
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
        <div className="bg-secondary p-6 rounded-t-xl">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Users className="h-6 w-6 text-primary" />
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
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>تاريخ الانضمام</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <Link
                          to={`/profile/${user.user_id}`}
                          className="text-secondary hover:underline"
                        >
                          {`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "غير متاح"}
                        </Link>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getTypeBadge(user.user_type)}</TableCell>
                      <TableCell>{user.phone_number || "غير متاح"}</TableCell>
                      <TableCell>{formatDate(user.registration_date)}</TableCell>
                      <TableCell>
                        <Link to={`/profile/${user.user_id}`}>
                          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <span>عرض</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      لا يوجد مستخدمون لعرضهم.
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
