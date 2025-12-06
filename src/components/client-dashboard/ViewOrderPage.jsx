import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, MapPin, Calendar, Clock, User, DollarSign, Info } from 'lucide-react';
import { format } from 'date-fns';
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
import { Textarea } from "../ui/textarea";
import {
  fetchSingleOrder,
  clearError,
  clearCurrentViewingOrder,
  cancelOrder,
  acceptOffer,
  releaseFunds, // Import releaseFunds
  initiateDispute, // Import initiateDispute
} from '../../redux/orderSlice';

const ViewOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentViewingOrder, loading, error, successMessage } = useSelector((state) => state.orders);

  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchSingleOrder(orderId));
    }

    return () => {
      dispatch(clearCurrentViewingOrder());
    };
  }, [dispatch, orderId]);

  useEffect(() => {
    if (error) {
      toast.error(error?.detail || error?.message || error || "حدث خطأ أثناء جلب تفاصيل الطلب.");
      dispatch(clearError());
      // No navigation back to list on fetch error, allow user to retry or manually navigate
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(fetchSingleOrder(orderId)); // Refresh the order after successful action
      // Clear success message after displaying and refreshing
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch, orderId]);

  const handleCancelOrder = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(cancelOrder({ orderId, cancellationReason: 'Cancelled by user from view page' })).unwrap();
    } catch (err) {
      // Error is handled by the global error handler in the slice
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptOffer = async (orderId, offerId) => {
    setIsSubmitting(true);
    try {
      await dispatch(acceptOffer({ orderId, offerId })).unwrap();
    } catch (err) {
      console.error('Failed to accept offer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReleaseFunds = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(releaseFunds(orderId)).unwrap();
      toast.success("تم تحرير الأموال بنجاح للفني.");
    } catch (err) {
      toast.error(err.message || "فشل في تحرير الأموال.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiateDispute = async () => {
    if (!disputeReason.trim()) {
      toast.error("الرجاء تقديم سبب للنزاع.");
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(initiateDispute({ orderId, argument: disputeReason })).unwrap();
      toast.success("تم فتح نزاع بنجاح.");
      setShowDisputeDialog(false);
      setDisputeReason("");
    } catch (err) {
      toast.error(err.message || "فشل في فتح النزاع.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-indigo-100 text-indigo-800';
      case 'AWAITING_RELEASE':
        return 'bg-purple-100 text-purple-800'; // New status color
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
        return 'بانتظار الإفراج'; // New status text
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
        return 'غير محدد';
    }
  };

  // Display loading state if the order is being fetched
  if (loading || !currentViewingOrder) {
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-gray-600">جاري تحميل تفاصيل الطلب...</p>
      </div>
    );
  }

  const hasAssociatedOffer = currentViewingOrder.associated_offer;
  const associatedOfferedPrice = hasAssociatedOffer ? currentViewingOrder.associated_offer.offered_price : null;
  const associatedOfferDescription = hasAssociatedOffer ? currentViewingOrder.associated_offer.offer_description : null;
  const associatedOfferTechnician = hasAssociatedOffer ? currentViewingOrder.associated_offer.technician_user : null;

  const projectOffers = currentViewingOrder.project_offers || [];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">تفاصيل الطلب #{orderId}</h1>
        <p className="text-gray-600">عرض كافة تفاصيل طلب الخدمة الخاص بك.</p>
      </div>

      <Card className="shadow-lg border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            {currentViewingOrder.service?.arabic_name || currentViewingOrder.service?.service_name || 'خدمة غير معروفة'}
          </CardTitle>
          <Badge className={getStatusColor(currentViewingOrder.order_status)}>
            <Info className="h-4 w-4 ml-1" />
            {getStatusText(currentViewingOrder.order_status)}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <p>الموقع: <span className="font-medium">{currentViewingOrder.requested_location}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <p>التاريخ المحدد: <span className="font-medium">{format(new Date(currentViewingOrder.scheduled_date), 'PPP')}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <p>الوقت: <span className="font-medium">{currentViewingOrder.scheduled_time_start} - {currentViewingOrder.scheduled_time_end}</span></p>
            </div>
            {(associatedOfferTechnician || currentViewingOrder.technician_user) && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <p>الفني: <span className="font-medium">{(associatedOfferTechnician || currentViewingOrder.technician_user).first_name} {(associatedOfferTechnician || currentViewingOrder.technician_user).last_name}</span></p>
              </div>
            )}
            {currentViewingOrder.final_price && currentViewingOrder.order_type === 'direct_hire' && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <p>السعر النهائي: <span className="font-medium">${currentViewingOrder.final_price}</span></p>
              </div>
            )}
            {currentViewingOrder.expected_price && currentViewingOrder.order_type === 'service_request' && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <p>السعر المتوقع: <span className="font-medium">${currentViewingOrder.expected_price}</span></p>
              </div>
            )}
            {associatedOfferedPrice && (currentViewingOrder.order_type === 'service_request' || currentViewingOrder.order_type === 'direct_hire') && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <p>السعر المعروض (العرض المحدد): <span className="font-medium">${associatedOfferedPrice}</span></p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold border-b pb-2 mb-2">وصف المشكلة</h3>
            <p className="text-gray-700 dark:text-gray-300">{currentViewingOrder.problem_description}</p>
          </div>

          {associatedOfferDescription && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold border-b pb-2 mb-2">رسالة العرض (العرض المحدد)</h3>
              <p className="text-gray-700 dark:text-gray-300">{associatedOfferDescription}</p>
            </div>
          )}

          {projectOffers.length > 0 && currentViewingOrder.order_type === 'service_request' && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold border-b pb-2 mb-2">العروض المقدمة ({projectOffers.length})</h3>
              <div className="grid grid-cols-1 gap-4">
                {projectOffers.map((offer) => (
                  <Card key={offer.offer_id} className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">
                        <User className="h-4 w-4 inline-block ml-1 text-gray-600" />
                        الفني: {offer.technician_user.first_name} {offer.technician_user.last_name}
                      </p>
                      <Badge variant="secondary" className="mr-2">
                        {offer.status === 'pending' ? 'معلقة' : offer.status === 'accepted' ? 'مقبولة' : 'مرفوضة'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <p>السعر المقترح: <span className="font-medium">${offer.offered_price}</span></p>
                    </div>
                    {offer.offer_description && (
                      <div className="space-y-1">
                        <p className="text-gray-700 dark:text-gray-300">
                          <Info className="h-4 w-4 inline-block ml-1 text-gray-600" />
                          رسالة الفني: {offer.offer_description}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button onClick={() => navigate('/client-dashboard/orders-offers')} variant="outline" disabled={isSubmitting}>
              العودة إلى الطلبات
            </Button>
            {(currentViewingOrder.order_status === 'OPEN' ||
              currentViewingOrder.order_status === 'AWAITING_TECHNICIAN_RESPONSE' ||
              currentViewingOrder.order_status === 'PENDING' ||
              currentViewingOrder.order_status === 'ACCEPTED') && (
                <Button onClick={handleCancelOrder} variant="destructive" disabled={isSubmitting}>
                  إلغاء الطلب
                </Button>
              )}
            {(currentViewingOrder.order_status === 'OPEN' || currentViewingOrder.order_status === 'AWAITING_TECHNICIAN_RESPONSE') && (
              <Button onClick={() => navigate(`/client-dashboard/orders-offers/edit/${currentViewingOrder.order_id}`)} disabled={isSubmitting}>
                تعديل الطلب
              </Button>
            )}
            {currentViewingOrder.order_status === 'AWAITING_CLIENT_ESCROW_CONFIRMATION' && currentViewingOrder.associated_offer && (
              <Button
                variant="success"
                onClick={() => handleAcceptOffer(currentViewingOrder.order_id, currentViewingOrder.associated_offer.offer_id)}
                disabled={isSubmitting}
              >
                تأكيد وتمويل الضمان
              </Button>
            )}

            {currentViewingOrder.order_status === 'AWAITING_RELEASE' && (
              <>
                <Button onClick={() => setShowDisputeDialog(true)} variant="destructive" disabled={isSubmitting}>
                  رفض وفتح نزاع
                </Button>
                <Button onClick={handleReleaseFunds} disabled={isSubmitting}>
                  {isSubmitting ? "جاري التحرير..." : "الموافقة وتحرير الدفع"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dispute Confirmation Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>فتح نزاع</DialogTitle>
            <DialogDescription>
              الرجاء تقديم سبب لرفض طلب الدفع وفتح نزاع. سيتم إخطار الفني وسيتدخل المسؤول لحل المشكلة.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="سبب النزاع"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>إلغاء</Button>
            </DialogClose>
            <Button onClick={handleInitiateDispute} disabled={isSubmitting}>
              {isSubmitting ? "جاري الفتح..." : "تأكيد وفتح نزاع"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewOrderPage;
