import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Loader2, MapPin, Calendar, Clock, User, DollarSign, Info, ChevronDown, ChevronUp, Star, XCircle } from 'lucide-react';
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
import { Textarea } from "../ui/textarea";
import {
  fetchSingleOrder,
  clearError,
  clearCurrentViewingOrder,
  cancelOrder,
  acceptOffer,
  releaseFunds,
  submitReview,
  clearSuccessMessage,
} from '../../redux/orderSlice';
import { initiateDispute } from '../../redux/orderSlice';
import OfferCard from './OfferCard';
import StarRating from '../ui/StarRating';
import BASE_URL from "../../config/api";

const ViewOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentViewingOrder, loading, error, successMessage, user } = useSelector((state) => state.orders);
  const { user: authUser } = useSelector((state) => state.auth);

  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedOffers, setExpandedOffers] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTechnicianId, setReviewTechnicianId] = useState(null);

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
      toast.success(`نجح: ${successMessage}`);
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
    if (!disputeDescription.trim()) {
      toast.error("الرجاء تقديم وصف للنزاع.");
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(initiateDispute({
        orderId: orderId,
        argument: disputeDescription,
      })).unwrap();
      toast.success("تم فتح نزاع بنجاح.");
      setShowDisputeDialog(false);
      setDisputeReason("");
      setDisputeDescription("");
      dispatch(fetchSingleOrder(orderId));
    } catch (err) {
      toast.error(err.message || "فشل في فتح النزاع.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrderClick = () => {
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellationReason) {
      toast.error('الرجاء إدخال سبب الإلغاء.');
      return;
    }
    setIsCancelling(true);
    try {
      await dispatch(cancelOrder({ orderId: currentViewingOrder.order_id, cancellationReason })).unwrap();
      setIsCancelModalOpen(false);
      setCancellationReason('');
      dispatch(fetchSingleOrder(orderId));
    } catch (err) {
      console.error('Failed to cancel order:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitReviewClick = () => {
    const technicianId = currentViewingOrder.associated_offer?.technician_user?.user_id || currentViewingOrder.technician_user?.user_id;
    if (!technicianId) {
      toast.error('معلومات الفني غير متوفرة.');
      return;
    }
    setReviewTechnicianId(technicianId);
    setIsReviewModalOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!reviewRating || parseFloat(reviewRating) < 1 || parseFloat(reviewRating) > 5) {
      toast.error('الرجاء إدخال تقييم بين 1 و 5.');
      return;
    }
    if (!reviewComment) {
      toast.error('الرجاء إدخال تعليق للمراجعة.');
      return;
    }
    if (!authUser?.user_id) {
      toast.error('بيانات المستخدم غير متوفرة لتقديم المراجعة.');
      return;
    }

    try {
      await dispatch(submitReview({
        order: currentViewingOrder.order_id,
        technician: reviewTechnicianId,
        rating: parseFloat(reviewRating),
        comment: reviewComment,
      })).unwrap();
      setIsReviewModalOpen(false);
      setReviewRating('');
      setReviewComment('');
      setReviewTechnicianId(null);
      dispatch(fetchSingleOrder(orderId));
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  const toggleExpandedOffers = () => {
    setExpandedOffers(!expandedOffers);
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
      case 'ACCEPTED':
        return 'مقبولة';
      case 'IN_PROGRESS':
        return 'قيد التنفيذ';
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
      case 'AWAITING_RELEASE':
        return 'بانتظار الإفراج';
      default:
        return status;
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
          {/* Client Information Section */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold mb-3 text-blue-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              معلومات العميل
            </h3>
            <Link to={`/profile/${currentViewingOrder.client_user?.user_id}`} className="flex items-center space-x-4 rtl:space-x-reverse hover:underline">
              <img
                src={`${BASE_URL}/users/${currentViewingOrder.client_user?.user_id}/profile_photo/`}
                alt="Client Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="ms-1">
                <p className="text-sm font-medium text-muted-foreground">العميل</p>
                <p className="text-lg font-semibold">{currentViewingOrder.client_user?.first_name} {currentViewingOrder.client_user?.last_name || currentViewingOrder.client_user?.username || "غير متاح"}</p>
              </div>
            </Link>
          </div>

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
                <p>السعر النهائي: <span className="font-medium">{currentViewingOrder.final_price} ج.م</span></p>
              </div>
            )}
            {currentViewingOrder.expected_price && currentViewingOrder.order_type === 'service_request' && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <p>السعر المتوقع: <span className="font-medium">{currentViewingOrder.expected_price} ج.م</span></p>
              </div>
            )}
            {associatedOfferedPrice && (currentViewingOrder.order_type === 'service_request' || currentViewingOrder.order_type === 'direct_hire') && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <p>السعر المعروض (العرض المحدد): <span className="font-medium">{associatedOfferedPrice} ج.م</span></p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-500" />
              <p>نوع الطلب: <span className="font-medium">
                {currentViewingOrder.order_type === 'service_request' ? 'طلب خدمة' :
                 currentViewingOrder.order_type === 'direct_hire' ? 'توظيف مباشر' :
                 currentViewingOrder.order_type || "غير متاح"}
              </span></p>
            </div>
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

          {/* Expandable Offers Section */}
          {projectOffers.length > 0 && currentViewingOrder.order_type === 'service_request' && (
            <div className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300"
                onClick={toggleExpandedOffers}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">العروض المقدمة</h3>
                    <p className="text-sm text-blue-700">{projectOffers.length} عرض متاح</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    {projectOffers.length}
                  </Badge>
                  {expandedOffers ? (
                    <ChevronUp className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </div>

              {expandedOffers && (
                <div className="mt-4 ml-6 mr-2 border-l-2 border-blue-200 pl-4 pb-4 border-b border-blue-100">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-blue-200"></div>
                      تفاصيل العروض
                      <div className="w-8 h-0.5 bg-blue-200"></div>
                    </h4>
                    <div className="space-y-3">
                      {projectOffers.map((offer) => (
                        <OfferCard
                          key={offer.offer_id}
                          offer={offer}
                          onAcceptOffer={(offerId) => handleAcceptOffer(currentViewingOrder.order_id, offerId)}
                          loading={isSubmitting}
                          orderStatus={currentViewingOrder.order_status}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Review Section */}
          {currentViewingOrder.order_status === 'COMPLETED' && (currentViewingOrder.technician_user || currentViewingOrder.associated_offer?.technician_user) && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-yellow-600 fill-current" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-900">تقييم الخدمة</h3>
                      <p className="text-sm text-yellow-700">
                        {currentViewingOrder.review_rating || currentViewingOrder.review_comment ?
                          'تم تقييم الخدمة' :
                          'شارك تجربتك مع الفني'
                        }
                      </p>
                    </div>
                  </div>
                  {!currentViewingOrder.review_rating && !currentViewingOrder.review_comment && (
                    <Button
                      onClick={handleSubmitReviewClick}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      disabled={isSubmitting}
                    >
                      كتابة مراجعة
                    </Button>
                  )}
                </div>

                {(currentViewingOrder.review_rating || currentViewingOrder.review_comment) && (
                  <div className="space-y-3">
                    {currentViewingOrder.review_rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < currentViewingOrder.review_rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                          {currentViewingOrder.review_rating}/5
                        </span>
                      </div>
                    )}
                    {currentViewingOrder.review_comment && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900 block mb-1">تعليق المراجعة:</span>
                        <p className="bg-white p-3 rounded border border-gray-200 italic text-gray-800">
                          "{currentViewingOrder.review_comment}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
            <Button onClick={() => navigate('/dashboard/orders-offers')} variant="outline" disabled={isSubmitting}>
              العودة إلى الطلبات
            </Button>

            {(currentViewingOrder.order_status === 'OPEN' ||
              currentViewingOrder.order_status === 'AWAITING_TECHNICIAN_RESPONSE' ||
              currentViewingOrder.order_status === 'PENDING' ||
              currentViewingOrder.order_status === 'ACCEPTED') && (
                <Button onClick={handleCancelOrderClick} variant="destructive" disabled={isSubmitting}>
                  إلغاء الطلب
                </Button>
              )}

            {(currentViewingOrder.order_status === 'OPEN' || currentViewingOrder.order_status === 'AWAITING_TECHNICIAN_RESPONSE') && (
              <Button onClick={() => navigate(`/dashboard/orders-offers/edit/${currentViewingOrder.order_id}`)} disabled={isSubmitting}>
                تعديل الطلب
              </Button>
            )}

            {currentViewingOrder.order_status === 'AWAITING_CLIENT_ESCROW_CONFIRMATION' && currentViewingOrder.associated_offer && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
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
                <Button onClick={handleReleaseFunds} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSubmitting ? "جاري التحرير..." : "الموافقة وتحرير الدفع"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dispute Confirmation Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-red-600" />
              </div>
              فتح نزاع
            </DialogTitle>
            <DialogDescription>
              الرجاء تقديم سبب لرفض طلب الدفع وفتح نزاع. سيتم إخطار الفني وسيتدخل المسؤول لحل المشكلة.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="disputeDescription">وصف النزاع</Label>
              <Textarea
                id="disputeDescription"
                placeholder="صف تفاصيل النزاع هنا..."
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

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              تأكيد الإلغاء
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد إلغاء هذا الطلب؟ الرجاء تقديم سبب الإلغاء.
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
                disabled={isCancelling}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} disabled={isCancelling}>
              إلغاء
            </Button>
            <Button onClick={handleConfirmCancel} disabled={isCancelling} variant="destructive">
              {isCancelling ? (
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

      {/* Submit Review Dialog */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-yellow-600 fill-current" />
              </div>
              كتابة مراجعة
            </DialogTitle>
            <DialogDescription>
              الرجاء تقييم الفني وتقديم تعليق حول الخدمة المقدمة.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <Label>التقييم</Label>
              <div className="flex items-center gap-4">
                <StarRating
                  rating={parseFloat(reviewRating) || 0}
                  onRatingChange={(rating) => setReviewRating(rating.toString())}
                  size="lg"
                />
                <span className="text-sm text-gray-500">
                  {reviewRating ? `${reviewRating}/5` : 'اختر تقييمًا'}
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reviewComment">التعليق</Label>
              <Textarea
                id="reviewComment"
                placeholder="اكتب تعليقك حول الخدمة المقدمة..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleConfirmReview} className="bg-yellow-600 hover:bg-yellow-700 text-white">
              إرسال المراجعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewOrderPage;
