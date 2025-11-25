import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Briefcase, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../utils/api"; // Import the API utility

export function WorkerTasks() {
  const { token } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkerTasks = async () => {
      if (!token) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch all worker tasks (orders)
        const data = await api.get("/orders/worker-tasks/", {
          headers: { Authorization: `Bearer ${token}` },
        }); // Adjust endpoint and query params as per your backend API
        setTasks(data.results.map(task => ({
          id: task.id,
          client: task.client_name,
          service: task.service_name,
          location: task.location,
          date: new Date(task.scheduled_date).toLocaleDateString("ar-EG"),
          amount: `$${task.total_price || 0}`,
          status: task.status,
          detailsLink: `/worker-dashboard/tasks/${task.id}`, // Placeholder for detail page
        })));
      } catch (err) {
        setError(err.message || "Failed to fetch worker tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerTasks();
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
    const config = variants[status] || { variant: "default", className: "bg-gray-100 text-gray-800" };
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  if (loading) return <div className="text-center p-8">جاري تحميل المهام...</div>;
  if (error) return <div className="text-center p-8 text-red-500">خطأ: {error}</div>;

  if (tasks.length === 0) {
    return <div className="text-center p-8">لا توجد مهام حاليًا.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <Briefcase className="h-7 w-7" />
          <span>مهامي</span>
        </h1>
        <p className="text-muted-foreground">إدارة مهامك المجدولة والنشطة</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العميل</TableHead>
                <TableHead>الخدمة</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.client || "N/A"}</TableCell>
                  <TableCell>{task.service}</TableCell>
                  <TableCell>{task.location || "N/A"}</TableCell>
                  <TableCell>{task.date}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{task.amount}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild className="flex items-center space-x-2">
                      <Link to={task.detailsLink}>
                        <Eye className="h-4 w-4" />
                        <span>عرض التفاصيل</span>
                      </Link>
                    </Button>
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
