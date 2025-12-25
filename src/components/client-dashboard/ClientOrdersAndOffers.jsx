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
  initiateDispute,
} from '../../redux/orderSlice';
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
    successMessage,
    clientOrdersPagination
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
 const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderStatus, setOrderStatus] = useState('');

 useEffect(() => {
    if (user?.user_id) {
      dispatch(getClientOrders({ page: currentPage, pageSize, orderStatus }));
    }
 }, [dispatch, user, currentPage, pageSize, orderStatus]);

  useEffect(() => {
    if (successMessage) {
      toast.success(`نجح: ${successMessage}`);
      dispatch(clearSuccessMessage());
    }
    if (error) {
      const errorMessageToDisplay = error.detail || error.message || 'حدث خطأ غير معروف.';
      toast.error(`خطأ: ${errorMessageToDisplay}`);
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

  const handleConfirmDispute = async () => {
    if (!disputeDescription) {
      toast.error('الرجاء إدخال وصف النزاع.');
      return;
    }
    try {
      await dispatch(initiateDispute({
        orderId: selectedOrder.order_id,
        argument: disputeDescription,
      })).unwrap();
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

  const handleOrderStatusChange = (e) => {
    setOrderStatus(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleClearFilter = () => {
    setOrderStatus('');
    setCurrentPage(1);
  };

  // Sort clientOrders by order_id
  const sortedClientOrders = Array.isArray(clientOrders) 
    ? [...clientOrders].sort((a, b) => b.order_id - a.order_id) 
    : [];

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">طلباتي وعروضي</h1>
        <p className="text-gray-600">إدارة طلباتك للخدمة ومراجعة عروض الفنيين.</p>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
            <div className="w-full sm:w-auto">
              <Label htmlFor="orderStatus">حالة الطلب</Label>
              <select
                id="orderStatus"
                value={orderStatus}
                onChange={handleOrderStatusChange}
                className="mt-1 block w-full sm:w-48 border border-gray-30 rounded-md shadow-sm p-2"
              >
                <option value="">جميع الحالات</option>
                <option value="OPEN">مفتوح</option>
                <option value="ACCEPTED">مقبول</option>
                <option value="IN_PROGRESS">جاري التنفيذ</option>
                <option value="AWAITING_RELEASE">في انتظار التحرير</option>
                <option value="COMPLETED">مكتمل</option>
                <option value="DISPUTED">متنازع عليها</option>
                <option value="CANCELLED">ملغي</option>
                <option value="REFUNDED">مسترجع</option>
                <option value="AWAITING_TECHNICIAN_RESPONSE">في انتظار رد الفني</option>
                <option value="AWAITING_CLIENT_ESCROW_CONFIRMATION">في انتظار تأكيد العميل</option>
              </select>
            </div>
            {orderStatus && (
              <Button
                variant="outline"
                onClick={handleClearFilter}
                className="mt-4 sm:mt-6 px-4 py-2"
              >
                مسح الفلتر
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Loading indicator for initial load */}
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
        <div className="space-y-4 relative">
          {/* Loading overlay for pagination/filtering */}
          {loading && clientOrders && clientOrders.length > 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>جاري تحميل البيانات...</span>
              </div>
            </div>
          )}
          <div className={!loading ? "" : "opacity-50 pointer-events-none"}>
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

      {/* Pagination Controls */}
      {clientOrdersPagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, clientOrdersPagination.totalPages))}
              disabled={currentPage === clientOrdersPagination.totalPages || loading}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                عرض <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> إلى{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, clientOrdersPagination.count)}
                </span>{' '}
                من <span className="font-medium">{clientOrdersPagination.count}</span> نتائج
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </>
                  ) : (
                    <>
                      <span className="sr-only">Previous</span>
                      &rarr;
                    </>
                  )}
                </button>

                {/* Page numbers */}
                {Array.from({ length: clientOrdersPagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      page === currentPage
                        ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                    } focus:outline-offset-0`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, clientOrdersPagination.totalPages))}
                  disabled={currentPage === clientOrdersPagination.totalPages || loading}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </>
                  ) : (
                    <>
                      <span className="sr-only">Next</span>
                      &larr;
                    </>
                  )}
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientOrdersAndOffers;
