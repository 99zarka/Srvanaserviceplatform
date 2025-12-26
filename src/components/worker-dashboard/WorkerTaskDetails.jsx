import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Loader2, MapPin, Calendar, Clock, User, DollarSign, Info, ArrowLeft, CheckCircle, XCircle, Flag, Play, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { markJobDone, cancelOrder, fetchTechnicianSingleOrder, startJob, initiateDispute } from "../../redux/orderSlice";
import BASE_URL from "../../config/api";

export function WorkerTaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { currentViewingOrder: task, loading, error } = useSelector((state) => state.orders);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showStartJobDialog, setShowStartJobDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [disputeDescription, setDisputeDescription] = useState("");

  useEffect(() => {
    if (token && taskId) {
      dispatch(fetchTechnicianSingleOrder(taskId));
    }
  }, [taskId, token, dispatch]);

  const handleMarkJobDone = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(markJobDone(task.order_id)).unwrap();
      toast.success("تم إرسال طلب الدفع بنجاح إلى العميل.");
      dispatch(fetchTechnicianSingleOrder(taskId));
      setShowCompleteDialog(false);
    } catch (err) {
      toast.error(err.message || "فشل في إرسال طلب الدفع.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellationReason.trim()) {
      toast.error("الرجاء تقديم سبب للإلغاء.");
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(cancelOrder({ orderId: task.order_id, cancellationReason })).unwrap();
      toast.success("تم إلغاء المهمة بنجاح.");
      setShowCancelDialog(false);
      setCancellationReason("");
      dispatch(fetchTechnicianSingleOrder(taskId));
    } catch (err) {
      toast.error(err.message || "فشل في إلغاء المهمة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartJob = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(startJob(task.order_id)).unwrap();
      toast.success("تم بدء المهمة بنجاح.");
      dispatch(fetchTechnicianSingleOrder(taskId));
      setShowStartJobDialog(false);
    } catch (err) {
      toast.error(err.message || "فشل في بدء المهمة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiateDispute = async () => {
    if (!disputeDescription.trim()) {
      toast.error("الرجاء تقديم وصف للنزاع.");
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(initiateDispute({
        orderId: task.order_id,
        argument: disputeDescription,
      })).unwrap();
      toast.success("تم فتح نزاع بنجاح.");
      setShowDisputeDialog(false);
      setDisputeDescription("");
      dispatch(fetchTechnicianSingleOrder(taskId));
    } catch (err) {
      toast.error(err.message || "فشل في فتح النزاع.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'AWAITING_RELEASE':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-teal-100 text-teal-800';
      case 'DISPUTED':
        return 'bg-orange-100 text-orange-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-pink-100 text-pink-800';
      case 'AWAITING_TECHNICIAN_RESPONSE':
        return 'bg-gray-200 text-gray-800';
      case 'AWAITING_CLIENT_ESCROW_CONFIRMATION':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'OPEN':
        return 'مفتوحة';
      case 'PENDING':
        return 'معلقة';
      case 'ACCEPTED':
        return 'مقبولة';
      case 'IN_PROGRESS':
        return 'قيد التنفيذ';
      case 'AWAITING_RELEASE':
        return 'بانتظار الإفراج';
      case 'COMPLETED':
        return 'مكتملة';
      case 'DISPUTED':
        return 'متنازع عليها';
      case 'CANCELLED':
        return 'ملغاة';
      case 'REFUNDED':
        return 'مستردة';
      case 'AWAITING_TECHNICIAN_RESPONSE':
        return 'بانتظار رد الفني';
      case 'AWAITING_CLIENT_ESCROW_CONFIRMATION':
        return 'بانتظار تأكيد العميل للدفع';
      default:
        return status;
    }
  };

  if (loading && !task) return (
    <div className="flex items-center justify-center py-12" dir="rtl">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="ml-2 text-gray-600">جاري تحميل تفاصيل المهمة...</p>
    </div>
  );

  if (error && !task) return (
    <div className="text-center p-8 text-red-500" dir="rtl">
      خطأ: {error?.message || String(error)}
    </div>
  );

  if (!task) {
    return (
      <div className="text-center p-8" dir="rtl">
        لم يتم العثور على المهمة.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">تفاصيل المهمة #{task.order_id}</h1>
        <p className="text-gray-600">عرض كافة تفاصيل المهمة الموكلة إليك.</p>
      </div>

      <Card className="shadow-lg border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            {task.service?.arabic_name || task.service?.service_name || 'خدمة غير معروفة'}
          </CardTitle>
          <Badge className={getStatusColor(task.order_status)}>
            <Info className="h-4 w-4 ml-1" />
            {getStatusText(task.order_status)}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Client Information Section */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold mb-3 text-blue-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              معلومات العميل
            </h3>
            <Link to={`/profile/${task.client_user?.user_id}`} className="flex items-center space-x-4 rtl:space-x-reverse hover:underline">
              <img
                src={`${BASE_URL}/users/${task.client_user?.user_id}/profile_photo/`}
                alt="Client Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="ms-1">
                <p className="text-sm font-medium text-muted-foreground">العميل</p>
                <p className="text-lg font-semibold">{task.client_user?.first_name} {task.client_user?.last_name || task.client_user?.username || "غير متاح"}</p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <p>الموقع: <span className="font-medium">{task.requested_location || "غير متاح"}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <p>التاريخ المحدد: <span className="font-medium">
                {task.scheduled_date ? format(new Date(task.scheduled_date), 'PPP', { locale: ar }) : "غير متاح"}
              </span></p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <p>الوقت: <span className="font-medium">{task.scheduled_time_start || "غير متاح"} - {task.scheduled_time_end || "غير متاح"}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <p>المبلغ النهائي: <span className="font-medium">{task.final_price ? `${task.final_price} ج.م` : "غير متاح"}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-500" />
              <p>نوع الطلب: <span className="font-medium">
                {task.order_type === 'service_request' ? 'طلب خدمة' :
                 task.order_type === 'direct_hire' ? 'توظيف مباشر' :
                 task.order_type || "غير متاح"}
              </span></p>
            </div>
          </div>

          {/* Problem Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold border-b pb-2 mb-2">وصف المشكلة</h3>
            <p className="text-gray-700 dark:text-gray-300">{task.problem_description || "لا يوجد وصف."}</p>
          </div>

          {/* Optional Observations and Notes */}
          {(task.initial_observations || task.proposal_notes) && (
            <div className="space-y-4">
              {task.initial_observations && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold mb-2 text-green-900">الملاحظات الأولية</h3>
                  <p className="text-green-800">{task.initial_observations}</p>
                </div>
              )}
              {task.proposal_notes && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold mb-2 text-purple-900">ملاحظات الاقتراح</h3>
                  <p className="text-purple-800">{task.proposal_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Updated Pricing and Schedule */}
          {(task.updated_price || task.updated_schedule_date || task.updated_schedule_time_start || task.updated_schedule_time_end) && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold mb-3 text-orange-900">التحديثات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {task.updated_price && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">السعر المحدث</p>
                    <p className="text-lg font-semibold">{`${task.updated_price} ج.م`}</p>
                  </div>
                )}
                {task.updated_schedule_date && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">تاريخ الجدول المحدث</p>
                    <p className="text-lg font-semibold">{format(new Date(task.updated_schedule_date), 'PPP', { locale: ar })}</p>
                  </div>
                )}
                {task.updated_schedule_time_start && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">وقت البدء المحدث</p>
                    <p className="text-lg font-semibold">{task.updated_schedule_time_start}</p>
                  </div>
                )}
                {task.updated_schedule_time_end && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">وقت الانتهاء المحدث</p>
                    <p className="text-lg font-semibold">{task.updated_schedule_time_end}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Review Section - Show client feedback on technician's work */}
          {task.order_status === 'COMPLETED' && task.review_rating && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-600 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-900">تقييم العميل</h3>
                    <p className="text-sm text-yellow-700">التقييم الذي تلقيته من العميل</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < task.review_rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                      {task.review_rating}/5
                    </span>
                  </div>
                  {task.review_comment && (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium text-gray-900 block mb-1">تعليق العميل:</span>
                      <p className="bg-white p-3 rounded border border-gray-200 italic text-gray-800">
                        "{task.review_comment}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
            <Button onClick={() => navigate('/dashboard/tasks')} variant="outline" disabled={isSubmitting}>
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة إلى المهام
            </Button>

            {task.order_status === 'ACCEPTED' && (
              <Button
                onClick={() => setShowStartJobDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                <Play className="h-4 w-4 ml-2" />
                بدء المهمة
              </Button>
            )}

            {(task.order_status === 'IN_PROGRESS' || task.order_status === 'ACCEPTED') && (
              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="outline"
                disabled={isSubmitting}
              >
                <XCircle className="h-4 w-4 ml-2" />
                إلغاء المهمة
              </Button>
            )}

            {task.order_status === 'IN_PROGRESS' && (
              <Button
                onClick={() => setShowCompleteDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isSubmitting}
              >
                <CheckCircle className="h-4 w-4 ml-2" />
                إتمام المهمة وطلب الدفع
              </Button>
            )}

            {(task.order_status === 'IN_PROGRESS' || task.order_status === 'AWAITING_RELEASE') && (
              <Button
                onClick={() => setShowDisputeDialog(true)}
                variant="destructive"
                disabled={isSubmitting}
              >
                <Flag className="h-4 w-4 ml-2" />
                فتح نزاع
              </Button>
            )}

            {task.order_status === 'DISPUTED' && (
              <Button
                asChild
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-50"
              >
                <Link to={`/dashboard/disputes/${task.order_id}`}>
                  <Flag className="h-4 w-4 ml-2" />
                  عرض النزاع
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Start Job Confirmation Dialog */}
      <Dialog open={showStartJobDialog} onOpenChange={setShowStartJobDialog}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Play className="h-4 w-4 text-blue-600" />
              </div>
              تأكيد بدء المهمة
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد بدء هذه المهمة؟ سيتم تغيير حالة الطلب إلى "قيد التنفيذ".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>إلغاء</Button>
            </DialogClose>
            <Button onClick={handleStartJob} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري البدء...
                </>
              ) : (
                "تأكيد البدء"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Completed Confirmation Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              تأكيد إتمام المهمة
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد إتمام هذه المهمة؟ سيتم إخطار العميل بانتظار الإفراج عن الأموال.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>إلغاء</Button>
            </DialogClose>
            <Button onClick={handleMarkJobDone} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الإتمام...
                </>
              ) : (
                "تأكيد الإتمام"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              تأكيد الإلغاء
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد إلغاء هذه المهمة؟ الرجاء تقديم سبب للإلغاء.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cancellationReason">سبب الإلغاء</Label>
              <Textarea
                id="cancellationReason"
                placeholder="أدخل سبب الإلغاء هنا..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>إلغاء</Button>
            </DialogClose>
            <Button onClick={handleCancelOrder} disabled={isSubmitting} variant="destructive">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الإلغاء...
                </>
              ) : (
                "تأكيد الإلغاء"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initiate Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Flag className="h-4 w-4 text-orange-600" />
              </div>
              فتح نزاع
            </DialogTitle>
            <DialogDescription>
              الرجاء تقديم وصف تفصيلي للمشكلة والنزاع. سيتم إخطار العميل وسيتدخل المسؤول لحل المشكلة.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="disputeDescription">وصف النزاع</Label>
              <Textarea
                id="disputeDescription"
                placeholder="صف تفاصيل المشكلة والنزاع هنا..."
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>إلغاء</Button>
            </DialogClose>
            <Button onClick={handleInitiateDispute} disabled={isSubmitting} variant="destructive">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الفتح...
                </>
              ) : (
                "تأكيد وفتح نزاع"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
