import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import api from "../../utils/api";
import { Badge } from "../ui/badge"; // Added Badge for status

export function WorkerTaskDetails() {
  const { taskId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!token) {
        setError("المستخدم غير مصادق عليه.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await api.get(`/orders/worker-tasks/${taskId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("WorkerTaskDetails: Received API Response:", response); // Debugging: log the full response
        setTask(response); // Directly set the response as the task, as api.get returns parsed JSON
      } catch (err) {
        console.error("Error fetching task details:", err); // Debugging
        setError(err.message || "فشل في جلب تفاصيل المهمة.");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId, token]);

  if (loading) return <div className="text-center p-8" dir="rtl">جاري تحميل تفاصيل المهمة...</div>;
  if (error) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error}</div>;
  if (!task) {
    console.log("Task state is null or undefined, displaying 'Task not found'. Current task:", task); // Debugging
    return <div className="text-center p-8" dir="rtl">لم يتم العثور على المهمة.</div>;
  }

  const getStatusBadge = (status) => {
    const variants = {
      "pending": { variant: "outline", className: "bg-gray-100 text-gray-800" },
      "awaiting_technician_response": { variant: "outline", className: "bg-yellow-100 text-yellow-800" },
      "accepted": { variant: "default", className: "bg-blue-100 text-blue-800" },
      "in_progress": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "completed": { variant: "default", className: "bg-green-100 text-green-800" },
      "cancelled": { variant: "destructive", className: "bg-red-100 text-red-800" },
      "rejected": { variant: "destructive", className: "bg-red-100 text-red-800" },
      "on_hold": { variant: "outline", className: "bg-purple-100 text-purple-800" },
      "awaiting_payment": { variant: "default", className: "bg-indigo-100 text-indigo-800" },
      "disputed": { variant: "destructive", className: "bg-orange-100 text-orange-800" },
      "معلقة": { variant: "outline", className: "bg-gray-100 text-gray-800" },
      "بانتظار رد الفني": { variant: "outline", className: "bg-yellow-100 text-yellow-800" },
      "مقبولة": { variant: "default", className: "bg-blue-100 text-blue-800" },
      "قيد التنفيذ": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "مكتملة": { variant: "default", className: "bg-green-100 text-green-800" },
      "ملغاة": { variant: "destructive", className: "bg-red-100 text-red-800" },
      "مرفوضة": { variant: "destructive", className: "bg-red-100 text-red-800" },
      "معلقة مؤقتًا": { variant: "outline", className: "bg-purple-100 text-purple-800" },
      "بانتظار الدفع": { variant: "default", className: "bg-indigo-100 text-indigo-800" },
      "متنازع عليها": { variant: "destructive", className: "bg-orange-100 text-orange-800" },
    };

    let translatedStatus = status;
    switch (status) {
      case "pending":
        translatedStatus = "معلقة";
        break;
      case "awaiting_technician_response":
        translatedStatus = "بانتظار رد الفني";
        break;
      case "accepted":
        translatedStatus = "مقبولة";
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
      case "rejected":
        translatedStatus = "مرفوضة";
        break;
      case "on_hold":
        translatedStatus = "معلقة مؤقتًا";
        break;
      case "awaiting_payment":
        translatedStatus = "بانتظار الدفع";
        break;
      case "disputed":
        translatedStatus = "متنازع عليها";
        break;
    }
    const config = variants[status] || { variant: "outline", className: "bg-gray-100 text-gray-800" };
    return <Badge variant={config.variant} className={`${config.className} text-sm font-semibold`}>{translatedStatus}</Badge>;
  };


  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/worker-dashboard/tasks">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">تفاصيل المهمة #{task.order_id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>نظرة عامة على المهمة</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Client Information Section */}
          <div className="lg:col-span-2 border-b pb-4 mb-4">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">معلومات العميل</h3>
            <Link to={`/profile/${task.client_user?.user_id}`} className="flex items-center space-x-4 rtl:space-x-reverse hover:underline">
              {task.client_user?.profile_photo && (
                <img
                  src={task.client_user.profile_photo}
                  alt="Client Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">العميل</p>
                <p className="text-lg font-semibold">{task.client_user?.first_name} {task.client_user?.last_name || task.client_user?.username || "غير متاح"}</p>
              </div>
            </Link>
          </div>

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
            <div>
              <p className="text-sm font-medium text-muted-foreground">الخدمة</p>
              <p className="text-lg font-semibold">{task.service?.service_name || "غير متاح"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">نوع الطلب</p>
              <p className="text-lg">{task.order_type || "غير متاح"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">الحالة</p>
              <p className="text-lg">{getStatusBadge(task.order_status)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">الموقع المطلوب</p>
              <p className="text-lg">{task.requested_location || "غير متاح"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">التاريخ المجدول</p>
              <p className="text-lg">{new Date(task.scheduled_date).toLocaleDateString("ar-EG")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">وقت البدء المجدول</p>
              <p className="text-lg">{task.scheduled_time_start || "غير متاح"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">وقت الانتهاء المجدول</p>
              <p className="text-lg">{task.scheduled_time_end || "غير متاح"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">المبلغ النهائي</p>
              <p className="text-lg">{task.final_price ? `$${task.final_price}` : "غير متاح"}</p>
            </div>
          </div>

          {/* Problem Description */}
          <div className="col-span-full border-t pt-4 mt-4">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">وصف المشكلة</h3>
            <p className="text-base text-gray-700">{task.problem_description || "لا يوجد وصف."}</p>
          </div>

          {/* Optional Observations and Notes */}
          {(task.initial_observations || task.proposal_notes) && (
            <div className="col-span-full border-t pt-4 mt-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">ملاحظات</h3>
              {task.initial_observations && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">الملاحظات الأولية</p>
                  <p className="text-base text-gray-700">{task.initial_observations}</p>
                </div>
              )}
              {task.proposal_notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ملاحظات الاقتراح</p>
                  <p className="text-base text-gray-700">{task.proposal_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Updated Pricing and Schedule */}
          {(task.updated_price || task.updated_schedule_date || task.updated_schedule_time_start || task.updated_schedule_time_end) && (
            <div className="col-span-full border-t pt-4 mt-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">التحديثات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {task.updated_price && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">السعر المحدث</p>
                    <p className="text-lg">{`$${task.updated_price}`}</p>
                  </div>
                )}
                {task.updated_schedule_date && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">تاريخ الجدول المحدث</p>
                    <p className="text-lg">{new Date(task.updated_schedule_date).toLocaleDateString("ar-EG")}</p>
                  </div>
                )}
                {task.updated_schedule_time_start && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">وقت البدء المحدث</p>
                    <p className="text-lg">{task.updated_schedule_time_start}</p>
                  </div>
                )}
                {task.updated_schedule_time_end && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">وقت الانتهاء المحدث</p>
                    <p className="text-lg">{task.updated_schedule_time_end}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
