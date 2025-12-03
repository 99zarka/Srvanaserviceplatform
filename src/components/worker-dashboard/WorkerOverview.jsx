import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Home, Briefcase, DollarSign, Star, Clock, CheckCircle, LayoutDashboard, Eye, CalendarCheck, Zap, CalendarPlus, CreditCard, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Link } from "react-router-dom";
import api from "../../utils/api"; // Import the API utility

export function WorkerOverview() {
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [performance, setPerformance] = useState({ completedTasks: 0, earnings: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkerDashboardData = async () => {
      if (!token) {
        setError("المستخدم غير مصادق عليه.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch summary statistics
        const summaryData = await api.get("/technicians/worker-summary/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats([
          { label: "المهام النشطة", value: summaryData.active_tasks, icon: Clock, color: "text-primary" },
          { label: "المهام المكتملة", value: summaryData.completed_tasks, icon: CheckCircle, color: "text-green-600" },
          { label: "إجمالي الأرباح", value: `$${summaryData.total_earnings}`, icon: DollarSign, color: "text-blue-600" },
          { label: "التقييم", value: `${summaryData.average_rating}/5`, icon: Star, color: "text-yellow-600" },
        ]);

        // Fetch active tasks (orders) for the worker
        const tasksData = await api.get("/orders/worker-tasks/?status__in=scheduled,in_progress&limit=3", {
          headers: { Authorization: `Bearer ${token}` },
        }); // Adjust endpoint and query params
        setActiveTasks(tasksData.results.map(task => ({
          id: task.id,
          client: task.client_name || "غير متاح", // Assuming client_name is available
          service: task.service_name,
          location: task.location || "غير متاح", // Assuming location is available
          date: new Date(task.scheduled_date).toLocaleDateString("ar-EG"), // Assuming scheduled_date
          amount: `$${task.total_price || 0}`,
          status: task.status,
          detailsLink: `/worker-dashboard/tasks/${task.id}`, // Placeholder
        })));

        // Fetch monthly performance (example, assuming an endpoint)
        const monthlyPerformanceData = await api.get("/technicians/monthly-performance/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPerformance({
          completedTasks: monthlyPerformanceData.completed_tasks_month,
          earnings: monthlyPerformanceData.earnings_month,
          avgRating: monthlyPerformanceData.average_rating_month,
        });

      } catch (err) {
        setError(err.message || "فشل في جلب بيانات لوحة التحكم.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerDashboardData();
  }, [token]);

  const getStatusBadge = (status) => {
    const variants = {
      "scheduled": { variant: "default", className: "bg-blue-100 text-blue-800" },
      "in_progress": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "completed": { variant: "default", className: "bg-green-100 text-green-800" },
      "cancelled": { variant: "default", className: "bg-red-100 text-red-800" },
      "مجدولة": { variant: "default", className: "bg-blue-100 text-blue-800" }, // For static data fallback
      "قيد التنفيذ": { variant: "default", className: "bg-yellow-100 text-yellow-800" }, // For static data fallback
      "مكتملة": { variant: "default", className: "bg-green-100 text-green-800" }, // For static data fallback
    };
    let translatedStatus = status;
    switch (status) {
      case "scheduled":
        translatedStatus = "مجدولة";
        break;
      case "in_progress":
        translatedStatus = "قيد التنفيذ";
        break;
      case "completed":
        translatedStatus = "مكتملة";
        break;
      case "cancelled":
        translatedStatus = "ملغاة";
        break;
    }
    const config = variants[status] || { variant: "default", className: "bg-gray-100 text-gray-800" };
    return <Badge variant={config.variant} className={config.className}>{translatedStatus}</Badge>;
  };

  if (loading) return <div className="text-center py-20" dir="rtl">جاري تحميل لوحة التحكم...</div>;
  if (error) return <div className="text-center py-20 text-red-500" dir="rtl">خطأ: {error}</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <LayoutDashboard className="h-7 w-7" />
          <span>لوحة تحكم العامل</span>
        </h1>
        <p className="text-muted-foreground">تتبع مهامك، أرباحك، وأدائك</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">{stat.label}</p>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
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
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>المهام النشطة</span>
            </CardTitle>
            <Button variant="outline" asChild className="flex items-center space-x-2">
              <Link to="/worker-dashboard/tasks">
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
                <TableHead>العميل</TableHead>
                <TableHead>الخدمة</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المبلغ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTasks.length > 0 ? (
                activeTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.client}</TableCell>
                    <TableCell>{task.service}</TableCell>
                    <TableCell>{task.location}</TableCell>
                    <TableCell>{task.date}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{task.amount}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">لا توجد مهام نشطة حاليًا.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarCheck className="h-5 w-5" />
              <span>هذا الشهر</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">المهام المكتملة</span>
                <span>{performance.completedTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الأرباح</span>
                <span className="text-green-600">${performance.earnings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">متوسط التقييم</span>
                <span className="text-yellow-600">{performance.avgRating} ⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>إجراءات سريعة</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center space-x-2">
                <CalendarPlus className="h-5 w-5" />
                <span>تحديث التوفر</span>
              </Button>
              <Button variant="outline" asChild className="w-full flex items-center justify-center space-x-2">
                <Link to="/worker-dashboard/earnings">
                  <CreditCard className="h-5 w-5" />
                  <span>عرض سجل الدفعات</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                <Edit className="h-5 w-5" />
                <span>تعديل الملف الشخصي</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
