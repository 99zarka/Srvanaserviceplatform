import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  getClientOrders, 
  getOrderOffers, 
  acceptOffer, 
  cancelOrder, 
  releaseFunds, 
  submitReview, 
  clearError, 
  clearSuccessMessage,
} from '../../redux/orderSlice';
import { useCreateDisputeMutation } from '../../redux/disputeSlice';
import { Clock, CheckCircle, XCircle, DollarSign, User, MapPin, Calendar, Loader2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import EditOrderForm from '../EditOrderForm'; // Import the renamed component

const ClientOrdersAndOffers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    clientOrders, 
    currentOrderOffers, 
    loading, 
    error, 
    successMessage 
  } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false); // Local loading state for cancellation
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState(''); // Keep for UI, but not sent to backend
  const [disputeDescription, setDisputeDescription] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTechnicianId, setReviewTechnicianId] = useState(null);


  useEffect(() => {
    if (user?.user_id) {
      dispatch(getClientOrders());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
      // No explicit refetch here. Rely on Redux state update.
    }
    if (error) {
      const errorMessageToDisplay = error.detail || error.message || 'An unknown error occurred.';
      toast.error(errorMessageToDisplay);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch]);

  const handleViewOffers = (orderId) => {
    setSelectedOrderId(orderId);
    dispatch(getOrderOffers(orderId));
  };

  const handleAcceptOffer = async (orderId, offerId) => {
    try {
      await dispatch(acceptOffer({ orderId, offerId })).unwrap();
      // Rely solely on the reducer to update the state.
    } catch (err) {
      // Error is handled by the global useEffect
    }
  };

  const handleCancelOrderClick = (orderId) => {
    setSelectedOrderId(orderId);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellationReason) {
      toast.error('الرجاء إدخال سبب الإلغاء.');
      return;
    }
    setIsCancelling(true);
    try {
      await dispatch(cancelOrder({ orderId: selectedOrderId, cancellationReason })).unwrap();
      setIsCancelModalOpen(false);
      setCancellationReason('');
      dispatch(getClientOrders()); // Explicitly refetch orders on success
    } catch (err) {
      console.error('Failed to cancel order:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReleaseFundsClick = async (orderId) => {
    if (window.confirm('هل أنت متأكد أنك تريد تحرير الأموال لهذا الطلب؟ سيؤدي هذا إلى إكمال الطلب.')) {
      try {
        await dispatch(releaseFunds(orderId)).unwrap();
        dispatch(getClientOrders()); // Explicitly refetch orders on success
      } catch (err) {
        console.error('Failed to release funds:', err);
      }
    }
  };

  const handleInitiateDisputeClick = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDisputeModalOpen(true);
  };

  const [createDispute] = useCreateDisputeMutation();

  const handleConfirmDispute = async () => {
    if (!disputeDescription) { // Only disputeDescription is sent to backend as client_argument
      toast.error('الرجاء إدخال وصف النزاع.');
      return;
    }
    try {
      await createDispute({
        order: selectedOrderId,
        client_argument: disputeDescription
      }).unwrap();
      setIsDisputeModalOpen(false);
      setDisputeReason('');
      setDisputeDescription('');
      dispatch(getClientOrders()); // Explicitly refetch orders on success
    } catch (err) {
      console.error('Failed to initiate dispute:', err);
    }
  };

  const handleSubmitReviewClick = (orderId, technicianId) => {
    setSelectedOrderId(orderId);
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
    if (!user?.user_id) {
      toast.error('بيانات المستخدم غير متوفرة لتقديم المراجعة.');
      return;
    }

    try {
      await dispatch(submitReview({
        order: selectedOrderId,
        technician: reviewTechnicianId,
        client: user.user_id,
        rating: parseFloat(reviewRating),
        comment: reviewComment,
      })).unwrap();
      setIsReviewModalOpen(false);
      setReviewRating('');
      setReviewComment('');
      setReviewTechnicianId(null);
      dispatch(getClientOrders()); // Explicitly refetch orders on success
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  const handleEditOrder = (orderId) => {
    navigate(`/dashboard/orders-offers/edit/${orderId}`);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/dashboard/orders-offers/view/${orderId}`);
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
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-teal-100 text-teal-800';
      case 'DISPUTED':
        return 'bg-orange-100 text-orange-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-pink-100 text-pink-800';
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
      case 'AWAITING_CLIENT_ESCROW_CONFIRMATION':
        return 'بانتظار تأكيد العميل للدفع';
      default:
        return 'غير محدد';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN':
      case 'PENDING':
      case 'AWAITING_RELEASE':
      case 'DISPUTED':
      case 'AWAITING_CLIENT_ESCROW_CONFIRMATION':
        return <Clock className="h-4 w-4" />;
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return <CheckCircle className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
      case 'REFUNDED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Sort clientOrders by order_id
  const sortedClientOrders = Array.isArray(clientOrders) 
    ? [...clientOrders].sort((a, b) => a.order_id - b.order_id) 
    : [];

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">طلباتي وعروضي</h1>
        <p className="text-gray-600">إدارة طلباتك للخدمة ومراجعة عروض الفنيين.</p>
      </div>

      {loading && (!clientOrders || clientOrders.length === 0) ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">جاري تحميل الطلبات...</span>
        </div>
      ) : (!clientOrders || clientOrders.length === 0) ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">لا توجد طلبات بعد</p>
          <Button onClick={() => navigate('/order-create')}>
            إنشاء طلبك الأول
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>طلباتي</CardTitle>
                <CardDescription>
                  {Array.isArray(clientOrders) ? clientOrders.length : 0} طلبات تم إنشاؤها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedClientOrders.map((order) => {
                    // Determine if the "تأكيد وتمويل الضمان" button should be disabled
                    const isAcceptOfferButtonDisabled = 
                      order.order_status !== 'AWAITING_CLIENT_ESCROW_CONFIRMATION' ||
                      (order.associated_offer && order.associated_offer.status === 'accepted') ||
                      order.order_status === 'ACCEPTED' ||
                      loading; // Also consider global loading state

                    const acceptOfferButtonText = 
                      (order.order_status === 'ACCEPTED' || (order.associated_offer && order.associated_offer.status === 'accepted'))
                        ? 'تم التأكيد' 
                        : 'تأكيد وتمويل الضمان';

                    // Add a check to ensure order and order.order_id are not undefined
                    return order && order.order_id ? (
                      <div
                        key={order.order_id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedOrderId === order.order_id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleViewOffers(order.order_id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">
                                {order.service?.arabic_name || order.service?.service_name || order.problem_description}
                              </h3>
                              <Badge className={getStatusColor(order.order_status)}>
                                {getStatusIcon(order.order_status)}
                                <span className="ml-1">{getStatusText(order.order_status)}</span>
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {order.requested_location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(order.scheduled_date), 'PPP')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {order.scheduled_time_start} - {order.scheduled_time_end}
                              </div>
                              {order.technician_user && (
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  تم التعيين لـ {order.technician_user.first_name}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {order.offers_count > 0 && (
                              <Badge variant="outline">
                                {order.offers_count} عروض
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {(order.order_status === 'OPEN' || order.order_status === 'PENDING') && (
                            <>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={(e) => { e.stopPropagation(); handleCancelOrderClick(order.order_id); }}
                                disabled={loading}
                              >
                                إلغاء الطلب
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => { e.stopPropagation(); handleEditOrder(order.order_id); }}
                                disabled={loading}
                              >
                                <Edit className="h-4 w-4 ml-2" />
                                تعديل الطلب
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => { e.stopPropagation(); handleViewOrder(order.order_id); }}
                                disabled={loading}
                              >
                                عرض تفاصيل الطلب
                              </Button>
                            </>
                          )}
                          {order.order_status === 'AWAITING_RELEASE' && (
                            <>
                              <Button 
                                variant="success" 
                                size="sm" 
                                onClick={(e) => { e.stopPropagation(); handleReleaseFundsClick(order.order_id); }}
                                disabled={loading}
                              >
                                تحرير الأموال
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => { e.stopPropagation(); handleInitiateDisputeClick(order.order_id); }}
                                disabled={loading}
                              >
                                فتح نزاع
                              </Button>
                            </>
                          )}
                          {order.order_status === 'COMPLETED' && order.technician_user && (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={(e) => { e.stopPropagation(); handleSubmitReviewClick(order.order_id, order.technician_user.user_id); }}
                              disabled={loading}
                            >
                              كتابة مراجعة
                            </Button>
                          )}
                          {order.order_status === 'DISPUTED' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => { e.stopPropagation(); navigate(`/disputes/${order.order_id}`); }}
                              disabled={loading}
                            >
                              عرض النزاع
                            </Button>
                          )}
                          {order.order_status === 'AWAITING_CLIENT_ESCROW_CONFIRMATION' && order.associated_offer && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleAcceptOffer(order.order_id, order.associated_offer.offer_id); }}
                              disabled={isAcceptOfferButtonDisabled}
                            >
                              {acceptOfferButtonText}
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : null // Render nothing if order or order_id is undefined
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedOrderId ? 'العروض المستلمة' : 'اختر طلبًا'}
                </CardTitle>
                <CardDescription>
                  {selectedOrderId 
                    ? 'راجع واقبل العروض من الفنيين'
                    : 'انقر على طلب لعرض العروض'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedOrderId ? (
                  <div className="text-center py-8 text-gray-500">
                    اختر طلبًا لعرض العروض
                  </div>
                ) : loading && (!currentOrderOffers || currentOrderOffers.length === 0) ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">جاري تحميل العروض...</span>
                  </div>
                ) : (!currentOrderOffers || currentOrderOffers.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>لم يتم استلام عروض بعد</p>
                    <p className="text-sm">سيقدم الفنيون عروضهم على طلبك قريبًا</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentOrderOffers.map((offer) => (
                      <div key={offer.offer_id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {offer.technician_user?.first_name} {offer.technician_user?.last_name}
                            </span>
                          </div>
                          <Badge className={getStatusColor(offer.status)}>
                            {getStatusText(offer.status)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-lg font-bold text-green-600">
                              ${offer.offered_price}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600">
                            {offer.offer_description}
                          </p>
                          
                          <div className="text-xs text-gray-500">
                            {format(new Date(offer.offer_date), 'PPP')}
                          </div>
                        </div>
                        
                        {offer.status === 'pending' && (
                          <div className="mt-4 pt-3 border-t">
                            <Button 
                              onClick={() => handleAcceptOffer(selectedOrderId, offer.offer_id)}
                              disabled={loading}
                              className="w-full"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="ml-2">جاري القبول...</span>
                                </>
                              ) : (
                                'قبول العرض'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الإلغاء</DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد إلغاء هذا الطلب؟ الرجاء تقديم سبب.
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleConfirmCancel} disabled={isCancelling}>
              {isCancelling ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initiate Dispute Dialog */}
      <Dialog open={isDisputeModalOpen} onOpenChange={setIsDisputeModalOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>فتح نزاع</DialogTitle>
            <DialogDescription>
              الرجاء تقديم تفاصيل النزاع الخاص بك.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="disputeReason">سبب النزاع</Label>
              <Input
                id="disputeReason"
                placeholder="سبب قصير للنزاع"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="disputeDescription">وصف النزاع</Label>
              <Textarea
                id="disputeDescription"
                placeholder="صف تفاصيل النزاع هنا..."
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisputeModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleConfirmDispute} disabled={loading}>
              {loading ? 'جاري فتح النزاع...' : 'تأكيد النزاع'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Review Dialog */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>كتابة مراجعة</DialogTitle>
            <DialogDescription>
              الرجاء تقييم الفني وتقديم تعليق.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reviewRating">التقييم (1-5)</Label>
              <Input
                id="reviewRating"
                type="number"
                min="1"
                max="5"
                placeholder="أدخل تقييمًا من 1 إلى 5"
                value={reviewRating}
                onChange={(e) => setReviewRating(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reviewComment">التعليق</Label>
              <Textarea
                id="reviewComment"
                placeholder="اكتب تعليقك هنا..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleConfirmReview} disabled={loading}>
              {loading ? 'جاري الإرسال...' : 'إرسال المراجعة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientOrdersAndOffers;
