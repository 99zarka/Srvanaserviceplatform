import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { 
  getClientOrders, 
  acceptOffer, 
  cancelOrder, 
  releaseFunds, 
  submitReview, 
  clearError, 
  clearSuccessMessage,
} from '../../redux/orderSlice';
import { useCreateDisputeMutation } from '../../redux/disputeSlice';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import EditOrderForm from '../EditOrderForm';
import OrderCard from './OrderCard';
import ExpandableOffers from './ExpandableOffers';
import StarRating from '../ui/StarRating';

const ClientOrdersAndOffers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    clientOrders, 
    loading, 
    error, 
    successMessage 
  } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
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
    }
    if (error) {
      const errorMessageToDisplay = error.detail || error.message || 'An unknown error occurred.';
      toast.error(errorMessageToDisplay);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch]);

  const handleToggleExpand = (orderId) => {
    const newExpandedOrderId = expandedOrderId === orderId ? null : orderId;
    setExpandedOrderId(newExpandedOrderId);
    
    // Update selected order for the expanded section
    if (newExpandedOrderId) {
      const order = clientOrders.find(o => o.order_id === newExpandedOrderId);
      setSelectedOrder(order);
    } else {
      setSelectedOrder(null);
    }
  };

  const handleAcceptOffer = async (orderId, offerId) => {
    try {
      await dispatch(acceptOffer({ orderId, offerId })).unwrap();
      setExpandedOrderId(null); // Close the expanded section after accepting
    } catch (err) {
      // Error is handled by the global useEffect
    }
 };

  const handleCancelOrderClick = (orderId) => {
    setSelectedOrder(clientOrders.find(o => o.order_id === orderId));
    setIsCancelModalOpen(true);
 };

  const handleConfirmCancel = async () => {
    if (!cancellationReason) {
      toast.error('الرجاء إدخال سبب الإلغاء.');
      return;
    }
    setIsCancelling(true);
    try {
      await dispatch(cancelOrder({ orderId: selectedOrder.order_id, cancellationReason })).unwrap();
      setIsCancelModalOpen(false);
      setCancellationReason('');
      setExpandedOrderId(null);
      dispatch(getClientOrders());
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
        setExpandedOrderId(null);
        dispatch(getClientOrders());
      } catch (err) {
        console.error('Failed to release funds:', err);
      }
    }
 };

  const handleInitiateDisputeClick = (orderId) => {
    setSelectedOrder(orderId);
    setIsDisputeModalOpen(true);
 };

  const [createDispute] = useCreateDisputeMutation();

  const handleConfirmDispute = async () => {
    if (!disputeDescription) {
      toast.error('الرجاء إدخال وصف النزاع.');
      return;
    }
    try {
      await createDispute({
        order: selectedOrder.order_id,
        client_argument: disputeDescription
      }).unwrap();
      setIsDisputeModalOpen(false);
      setDisputeReason('');
      setDisputeDescription('');
      setExpandedOrderId(null);
      dispatch(getClientOrders());
    } catch (err) {
      console.error('Failed to initiate dispute:', err);
    }
  };

  const handleSubmitReviewClick = (orderId, technicianId) => {
    setSelectedOrder(clientOrders.find(o => o.order_id === orderId));
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
        order: selectedOrder.order_id,
        technician: reviewTechnicianId,
        rating: parseFloat(reviewRating),
        comment: reviewComment,
      })).unwrap();
      setIsReviewModalOpen(false);
      setReviewRating('');
      setReviewComment('');
      setReviewTechnicianId(null);
      setExpandedOrderId(null);
      dispatch(getClientOrders());
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          {sortedClientOrders.map((order) => (
            <div key={order.order_id}>
              <OrderCard
                order={order}
                isSelected={expandedOrderId === order.order_id}
                onToggleExpand={() => handleToggleExpand(order.order_id)}
                onEdit={handleEditOrder}
                onView={handleViewOrder}
                onCancel={handleCancelOrderClick}
                onReleaseFunds={handleReleaseFundsClick}
                onInitiateDispute={handleInitiateDisputeClick}
                onSubmitReview={handleSubmitReviewClick}
                onAcceptOffer={handleAcceptOffer}
                loading={loading}
                orderId={order.order_id}
              />
              <ExpandableOffers
                order={order}
                offers={order.project_offers}
                isOpen={expandedOrderId === order.order_id}
                onAcceptOffer={handleAcceptOffer}
                loading={loading}
              />
            </div>
          ))}
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
              <Label>التقييم</Label>
              <div className="flex items-center gap-2">
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
