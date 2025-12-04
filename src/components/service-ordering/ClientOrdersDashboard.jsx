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
  cancelOrder, // Import new action
  releaseFunds, // Import new action
  submitReview, // Import new action
  clearError, 
  clearSuccessMessage 
} from '../../redux/orderSlice';
import { initiateDispute } from '../../redux/disputeSlice'; // Import new action from dispute slice
import { Clock, CheckCircle, XCircle, DollarSign, User, MapPin, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input'; // For review rating


const ClientOrdersDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    clientOrders, 
    currentOrderOffers, 
    loading, 
    error, 
    successMessage 
  } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth); // Get current user for review

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // State for modals
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTechnicianId, setReviewTechnicianId] = useState(null);


  useEffect(() => {
    dispatch(getClientOrders());
  }, [dispatch]);

  useEffect(() => {
    // Clear messages after 5 seconds
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccessMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleViewOffers = (orderId) => {
    setSelectedOrderId(orderId);
    dispatch(getOrderOffers(orderId));
  };

  const handleAcceptOffer = async (orderId, offerId) => {
    try {
      await dispatch(acceptOffer({ orderId, offerId })).unwrap();
      dispatch(getClientOrders()); // Refresh orders after accepting offer
    } catch (err) {
      console.error('Failed to accept offer:', err);
    }
  };

  const handleCancelOrderClick = (orderId) => {
    setSelectedOrderId(orderId);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellationReason) {
      alert('الرجاء إدخال سبب الإلغاء.');
      return;
    }
    try {
      await dispatch(cancelOrder({ orderId: selectedOrderId, cancellationReason })).unwrap();
      setIsCancelModalOpen(false);
      setCancellationReason('');
      dispatch(getClientOrders()); // Refresh orders
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  const handleReleaseFundsClick = async (orderId) => {
    if (window.confirm('هل أنت متأكد أنك تريد تحرير الأموال لهذا الطلب؟ سيؤدي هذا إلى إكمال الطلب.')) {
      try {
        await dispatch(releaseFunds(orderId)).unwrap();
        dispatch(getClientOrders()); // Refresh orders
      } catch (err) {
        console.error('Failed to release funds:', err);
      }
    }
  };

  const handleInitiateDisputeClick = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDisputeModalOpen(true);
  };

  const handleConfirmDispute = async () => {
    if (!disputeReason || !disputeDescription) {
      alert('الرجاء إدخال سبب ووصف النزاع.');
      return;
    }
    try {
      await dispatch(initiateDispute({ 
        order: selectedOrderId, 
        reason: disputeReason, 
        description: disputeDescription 
      })).unwrap();
      setIsDisputeModalOpen(false);
      setDisputeReason('');
      setDisputeDescription('');
      dispatch(getClientOrders()); // Refresh orders
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
      alert('الرجاء إدخال تقييم بين 1 و 5.');
      return;
    }
    if (!reviewComment) {
      alert('الرجاء إدخال تعليق للمراجعة.');
      return;
    }
    if (!user?.user_id) {
      alert('بيانات المستخدم غير متوفرة لتقديم المراجعة.');
      return;
    }

    try {
      await dispatch(submitReview({
        order: selectedOrderId,
        technician: reviewTechnicianId,
        client: user.user_id, // Current client's user_id
        rating: parseFloat(reviewRating),
        comment: reviewComment,
      })).unwrap();
      setIsReviewModalOpen(false);
      setReviewRating('');
      setReviewComment('');
      setReviewTechnicianId(null);
      dispatch(getClientOrders()); // Refresh orders
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': // Initial state when client creates order
        return 'bg-blue-100 text-blue-800';
      case 'PENDING': // Awaiting technician offers
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': // Client accepts an offer, order assigned to technician
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': // Technician starts working
        return 'bg-indigo-100 text-indigo-800';
      case 'AWAITING_RELEASE': // Technician marked as completed, awaiting client approval/fund release
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': // Client released funds
        return 'bg-teal-100 text-teal-800';
      case 'DISPUTED': // Dispute initiated
        return 'bg-orange-100 text-orange-800';
      case 'CANCELLED': // Order cancelled
        return 'bg-red-100 text-red-800';
      case 'REFUNDED': // Order refunded
        return 'bg-pink-100 text-pink-800';
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

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">طلباتي للخدمة</h1>
        <p className="text-gray-600">إدارة طلباتك ومراجعة عروض الفنيين</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>طلباتي</CardTitle>
              <CardDescription>
                {Array.isArray(clientOrders) ? clientOrders.length : 0} طلبات تم إنشاؤها
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                <div className="space-y-4">
                  {clientOrders.map((order) => (
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
                              {order.problem_description}
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

                      {/* Action Buttons */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(order.order_status === 'OPEN' || order.order_status === 'PENDING') && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={(e) => { e.stopPropagation(); handleCancelOrderClick(order.order_id); }}
                            disabled={loading}
                          >
                            إلغاء الطلب
                          </Button>
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
                            onClick={(e) => { e.stopPropagation(); navigate(`/disputes/${order.dispute_id}`); }} // Assuming dispute_id is available
                            disabled={loading}
                          >
                            عرض النزاع
                          </Button>
                        )}
                      </div> {/* End Action Buttons */}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Offers Panel */}
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
            <Button onClick={handleConfirmCancel} disabled={loading}>
              {loading ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
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

export default ClientOrdersDashboard;
