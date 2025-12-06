import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, ArrowLeft, User as UserIcon, Calendar, MessageSquare, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

import {
  fetchSingleDispute,
  resolveDispute,
  clearError,
  clearCurrentViewingDispute
} from '../../redux/orderSlice';

export function DisputeDetailsPage() {
  const { disputeId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth); // Assuming 'user' object in auth state
  const { currentViewingDispute: dispute, loading, error, successMessage } = useSelector((state) => state.orders);

  const isAdmin = user?.role === 'admin'; // Determine if the logged-in user is an admin

  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (token && disputeId) {
      dispatch(fetchSingleDispute(disputeId));
    }

    return () => {
      dispatch(clearCurrentViewingDispute());
    };
  }, [dispatch, disputeId, token]);

  useEffect(() => {
    if (error) {
      toast.error(error?.detail || error?.message || error || "حدث خطأ أثناء جلب تفاصيل النزاع.");
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(fetchSingleDispute(disputeId)); // Refresh dispute after successful action
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch, disputeId]);

  const handleResolveDispute = async () => {
    if (!resolution) {
      toast.error("الرجاء تحديد نتيجة للنزاع.");
      return;
    }
    setIsResolving(true);
    try {
      await dispatch(resolveDispute({ disputeId, resolution, adminNotes })).unwrap();
      toast.success("تم حل النزاع بنجاح.");
    } catch (err) {
      toast.error(err.message || "فشل في حل النزاع.");
    } finally {
      setIsResolving(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'OPEN': { variant: "default", className: "bg-blue-100 text-blue-800" },
      'IN_REVIEW': { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      'RESOLVED': { variant: "default", className: "bg-green-100 text-green-800" },
    };
    const config = variants[status] || { variant: "outline", className: "bg-gray-100 text-gray-800" };
    return <Badge variant={config.variant} className={`${config.className} text-sm font-semibold`}>{getTranslatedStatus(status)}</Badge>;
  };

  const getTranslatedStatus = (status) => {
    switch (status) {
      case 'OPEN': return 'مفتوح';
      case 'IN_REVIEW': return 'قيد المراجعة';
      case 'RESOLVED': return 'تم الحل';
      default: return status;
    }
  };

  const getTranslatedResolution = (resolution) => {
    switch (resolution) {
      case 'PAY_TECHNICIAN': return 'دفع للفني';
      case 'REFUND_CLIENT': return 'استرداد للعميل';
      case 'SPLIT_PAYMENT': return 'تقسيم الدفع';
      default: return resolution;
    }
  };

  if (loading && !dispute) {
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-gray-600">جاري تحميل تفاصيل النزاع...</p>
      </div>
    );
  }

  if (error && !dispute) {
    return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error}</div>;
  }

  if (!dispute) {
    return <div className="text-center p-8" dir="rtl">لم يتم العثور على النزاع.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl" dir="rtl">
      <div className="mb-6 flex items-center space-x-4 rtl:space-x-reverse">
        <Button variant="ghost" size="icon" asChild>
          <Link to={isAdmin ? "/admin-dashboard/disputes" : "/client-dashboard/orders-offers"}> {/* Adjust back link */}
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">تفاصيل النزاع #{dispute.dispute_id}</h1>
      </div>

      <Card className="shadow-lg border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            نزاع بخصوص الطلب #{dispute.order?.order_id || 'غير متاح'}
          </CardTitle>
          {getStatusBadge(dispute.status)}
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-500" />
              <p>البادئ: <span className="font-medium">{dispute.initiator?.first_name} {dispute.initiator?.last_name || dispute.initiator?.username}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <p>تاريخ الإنشاء: <span className="font-medium">{format(new Date(dispute.created_at), 'PPP - pp')}</span></p>
            </div>
            {dispute.resolution_date && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-gray-500" />
                <p>تاريخ الحل: <span className="font-medium">{format(new Date(dispute.resolution_date), 'PPP - pp')}</span></p>
              </div>
            )}
            {dispute.resolution && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <p>الحل: <span className="font-medium">{getTranslatedResolution(dispute.resolution)}</span></p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold border-b pb-2 mb-2">حجة العميل</h3>
            <p className="text-gray-700 dark:text-gray-300">{dispute.client_argument || 'لا توجد حجة مقدمة من العميل.'}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold border-b pb-2 mb-2">حجة الفني</h3>
            <p className="text-gray-700 dark:text-gray-300">{dispute.technician_argument || 'لا توجد حجة مقدمة من الفني.'}</p>
          </div>

          {dispute.admin_notes && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold border-b pb-2 mb-2">ملاحظات المسؤول</h3>
              <p className="text-gray-700 dark:text-gray-300">{dispute.admin_notes}</p>
            </div>
          )}

          {/* Admin Resolution Controls */}
          {isAdmin && dispute.status !== 'RESOLVED' && (
            <Card className="shadow-inner border-yellow-200 dark:border-yellow-700 mt-6 p-4">
              <CardHeader>
                <CardTitle className="text-xl">إجراءات حل النزاع (المسؤول)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="resolution-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نتيجة الحل:
                  </label>
                  <Select onValueChange={setResolution} value={resolution} disabled={isResolving}>
                    <SelectTrigger id="resolution-select" className="w-full">
                      <SelectValue placeholder="اختر نتيجة الحل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAY_TECHNICIAN">دفع للفني</SelectItem>
                      <SelectItem value="REFUND_CLIENT">استرداد للعميل</SelectItem>
                      <SelectItem value="SPLIT_PAYMENT">تقسيم الدفع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ملاحظات المسؤول:
                  </label>
                  <Textarea
                    id="admin-notes"
                    placeholder="أضف ملاحظاتك حول قرار الحل"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    disabled={isResolving}
                    rows={4}
                  />
                </div>
                <Button onClick={handleResolveDispute} disabled={isResolving}>
                  {isResolving ? "جاري الحل..." : "حل النزاع"}
                </Button>
              </CardContent>
            </Card>
          )}

          {dispute.status === 'RESOLVED' && (
            <div className="mt-6 p-4 border border-green-300 bg-green-50 dark:bg-green-900/20 rounded-md text-green-800 dark:text-green-200">
              <p className="font-semibold flex items-center">
                <CheckCircle className="h-5 w-5 ml-2" />
                تم حل النزاع.
              </p>
              {dispute.resolution && (
                <p>النتيجة: <span className="font-medium">{getTranslatedResolution(dispute.resolution)}</span></p>
              )}
              {dispute.admin_notes && (
                <p>ملاحظات المسؤول: <span className="italic">{dispute.admin_notes}</span></p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DisputeDetailsPage;
