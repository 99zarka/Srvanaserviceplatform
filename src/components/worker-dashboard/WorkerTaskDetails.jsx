import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import api from "../../utils/api";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog"; // Import dialog components
import { Textarea } from "../ui/textarea"; // Import Textarea
import { toast } from "sonner"; // Assuming sonner is used for toasts
import { markJobDone, cancelOrder, fetchTechnicianSingleOrder } from "../../redux/orderSlice"; // Import Redux thunks

export function WorkerTaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { currentViewingOrder: task, loading, error } = useSelector((state) => state.orders);
  
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token && taskId) {
      dispatch(fetchTechnicianSingleOrder(taskId));
    }
  }, [taskId, token, dispatch]);

  const handleMarkJobDone = async () => {
    if (!task || !token) {
      toast.error("حدث خطأ: لا توجد بيانات مهمة أو المستخدم غير مصادق عليه.");
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(markJobDone(task.order_id)).unwrap();
      toast.success("تم إرسال طلب الدفع بنجاح إلى العميل.");
      // The order status should be updated by the Redux slice automatically
      // No need to manually refetch if slice updates currentViewingOrder
    } catch (err) {
      toast.error(err.message || "فشل في إرسال طلب الدفع.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!task || !token || !cancellationReason.trim()) {
      toast.error("الرجاء تقديم سبب للإلغاء.");
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(cancelOrder({ orderId: task.order_id, cancellationReason })).unwrap();
      toast.success("تم إلغاء المهمة بنجاح.");
      setShowCancelDialog(false);
      setCancellationReason("");
      // The order status should be updated by the Redux slice automatically
    } catch (err) {
      toast.error(err.message || "فشل في إلغاء المهمة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !task) return <div className="text-center p-8" dir="rtl">جاري تحميل تفاصيل المهمة...</div>;
  if (error && !task) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error?.message || String(error)}</div>;
  if (!task) {
    return <div className="text-center p-8" dir="rtl">لم يتم العثور على المهمة.</div>;
  }

  const getStatusBadge = (status) => {
    const variants = {
      "OPEN": { variant: "outline", className: "bg-blue-100 text-blue-800" },
      "ACCEPTED": { variant: "default", className: "bg-green-100 text-green-800" },
      "IN_PROGRESS": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "AWAITING_RELEASE": { variant: "default", className: "bg-purple-100 text-purple-800" },
      "COMPLETED": { variant: "default", className: "bg-green-100 text-green-800" },
      "DISPUTED": { variant: "destructive", className: "bg-orange-100 text-orange-800" },
      "CANCELLED": { variant: "destructive", className: "bg-red-100 text-red-800" },
      "REFUNDED": { variant: "destructive", className: "bg-red-200 text-red-900" },
      "AWAITING_TECHNICIAN_RESPONSE": { variant: "outline", className: "bg-gray-200 text-gray-800" },
      "AWAITING_CLIENT_ESCROW_CONFIRMATION": { variant: "outline", className: "bg-yellow-200 text-yellow-800" },
      // Arabic translations
      "مفتوحة": { variant: "outline", className: "bg-blue-100 text-blue-800" },
      "مقبولة": { variant: "default", className: "bg-green-100 text-green-800" },
      "قيد التنفيذ": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "بانتظار الإفراج": { variant: "default", className: "bg-purple-100 text-purple-800" },
      "مكتملة": { variant: "default", className: "bg-green-100 text-green-800" },
      "متنازع عليها": { variant: "destructive", className: "bg-orange-100 text-orange-800" },
      "ملغاة": { variant: "destructive", className: "bg-red-100 text-red-800" },
      "مستردة": { variant: "destructive", className: "bg-red-200 text-red-900" },
      "بانتظار رد الفني": { variant: "outline", className: "bg-gray-200 text-gray-800" },
      "بانتظار تأكيد العميل للدفع": { variant: "outline", className: "bg-yellow-200 text-yellow-800" },
    };

    let translatedStatus = status;
    switch (status) {
      case "OPEN":
        translatedStatus = "مفتوحة";
        break;
      case "ACCEPTED":
        translatedStatus = "مقبولة";
        break;
      case "IN_PROGRESS":
        translatedStatus = "قيد التنفيذ";
        break;
      case "AWAITING_RELEASE":
        translatedStatus = "بانتظار الإفراج";
        break;
      case "COMPLETED":
        translatedStatus = "مكتملة";
        break;
      case "DISPUTED":
        translatedStatus = "متنازع عليها";
        break;
      case "CANCELLED":
        translatedStatus = "ملغاة";
        break;
      case "REFUNDED":
        translatedStatus = "مستردة";
        break;
      case "AWAITING_TECHNICIAN_RESPONSE":
        translatedStatus = "بانتظار رد الفني";
        break;
      case "AWAITING_CLIENT_ESCROW_CONFIRMATION":
        translatedStatus = "بانتظار تأكيد العميل للدفع";
        break;
      default:
        translatedStatus = status;
    }
    const config = variants[status] || { variant: "outline", className: "bg-gray-100 text-gray-800" };
    return <Badge variant={config.variant} className={`${config.className} text-sm font-semibold`}>{translatedStatus}</Badge>;
  };


  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/tasks">
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
              <p className="text-lg font-semibold">{task.service?.arabic_name || "غير متاح"}</p>
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
              <p className="text-lg">{task.final_price ? `${task.final_price} ج.م` : "غير متاح"}</p>
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
                    <p className="text-lg">{`${task.updated_price} ج.م`}</p>
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

          {/* Action Buttons for Technician */}
          {(task.order_status === "in_progress" || task.order_status === "accepted") && (
            <div className="col-span-full flex justify-end space-x-4 rtl:space-x-reverse mt-6">
              <Button onClick={() => setShowCancelDialog(true)} variant="outline" disabled={isSubmitting}>
                إلغاء المهمة
              </Button>
              <Button onClick={handleMarkJobDone} disabled={isSubmitting}>
                {isSubmitting ? "جاري الإرسال..." : "تحديد كمكتمل وطلب الدفع"}
              </Button>
            </div>
          )}

          {task.order_status === "awaiting_release" && (
            <div className="col-span-full flex justify-end mt-6">
              <p className="text-lg font-semibold text-indigo-700">بانتظار موافقة العميل على الدفع.</p>
            </div>
          )}

          {/* Cancel Confirmation Dialog */}
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>تأكيد الإلغاء</DialogTitle>
                <DialogDescription>
                  هل أنت متأكد أنك تريد إلغاء هذه المهمة؟ الرجاء تقديم سبب للإلغاء.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Textarea
                  placeholder="سبب الإلغاء"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isSubmitting}>إلغاء</Button>
                </DialogClose>
                <Button onClick={handleCancelOrder} disabled={isSubmitting}>
                  {isSubmitting ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
