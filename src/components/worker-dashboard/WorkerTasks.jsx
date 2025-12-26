import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { markJobDone, initiateDispute, getTechnicianOrders, startJob, clearError, clearSuccessMessage } from "../../redux/orderSlice";
import { toast } from "sonner";
import { InitiateDisputeDialog } from "../disputes/InitiateDisputeDialog";
import WorkerOrderCard from "./WorkerOrderCard";

export function WorkerTasks() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const {
    technicianOrders: tasks,
    loading,
    error,
    successMessage,
    technicianOrdersPagination
  } = useSelector((state) => state.orders);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showStartJobModal, setShowStartJobModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderStatus, setOrderStatus] = useState('');

  useEffect(() => {
    if (token) {
      dispatch(getTechnicianOrders({ page: currentPage, pageSize, orderStatus }));
    }
  }, [dispatch, token, currentPage, pageSize, orderStatus]);

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



  const handleMarkAsCompletedClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCompleteModal(true);
  };

  const handleConfirmMarkAsCompleted = async () => {
    if (selectedOrderId) {
      try {
        await dispatch(markJobDone(selectedOrderId)).unwrap();
        toast.success("تم إرسال طلب الدفع بنجاح إلى العميل.");
        dispatch(getTechnicianOrders());
      } catch (err) {
        toast.error(err.message || "فشل في إرسال طلب الدفع.");
      } finally {
        setShowCompleteModal(false);
        setSelectedOrderId(null);
      }
    }
  };

  const handleInitiateDisputeClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowDisputeModal(true);
  };

  // This function is now handled by InitiateDisputeDialog
  // const handleConfirmDispute = async () => {
  //   if (selectedOrderId && disputeDescription.trim()) {
  //     try {
  //       await dispatch(initiateDispute({
  //         orderId: selectedOrderId,
  //         argument: disputeDescription,
  //       })).unwrap();
  //       toast.success("تم فتح نزاع بنجاح.");
  //       dispatch(getTechnicianOrders());
  //     } catch (err) {
  //       toast.error(err.message || "فشل في فتح النزاع.");
  //     } finally {
  //       setShowDisputeModal(false);
  //       setSelectedOrderId(null);
  //       setDisputeReason("");
  //       setDisputeDescription("");
  //     }
  //   } else {
  //     toast.error("الرجاء تقديم وصف تفصيلي للنزاع.");
  //   }
  // };

  const handleStartJobClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowStartJobModal(true);
  };

  const handleConfirmStartJob = async () => {
    if (selectedOrderId) {
      try {
        await dispatch(startJob(selectedOrderId)).unwrap();
        toast.success("تم بدء المهمة بنجاح.");
        dispatch(getTechnicianOrders());
      } catch (err) {
        toast.error(err.message || "فشل في بدء المهمة.");
      } finally {
        setShowStartJobModal(false);
        setSelectedOrderId(null);
      }
    }
  };


  if (loading && tasks.length === 0) return <div className="text-center p-8" dir="rtl">جاري تحميل المهام...</div>;
  if (error) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error?.message || String(error)}</div>;

  if (tasks.length === 0) {
    return <div className="text-center p-8" dir="rtl">لا توجد مهام حاليًا.</div>;
  }

  const handleOrderStatusChange = (e) => {
    setOrderStatus(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleClearFilter = () => {
    setOrderStatus('');
    setCurrentPage(1);
  };

  // Sort tasks by order_id (most recent first)
  const sortedTasks = Array.isArray(tasks)
    ? [...tasks].sort((a, b) => b.order_id - a.order_id)
    : [];

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">مهامي</h1>
        <p className="text-gray-600">إدارة مهامك المجدولة والنشطة.</p>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
            <div className="w-full sm:w-auto">
              <Label htmlFor="orderStatus">حالة المهمة</Label>
              <select
                id="orderStatus"
                value={orderStatus}
                onChange={handleOrderStatusChange}
                className="mt-1 block w-full sm:w-48 border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">جميع الحالات</option>
                <option value="ACCEPTED">مقبولة</option>
                <option value="IN_PROGRESS">قيد التنفيذ</option>
                <option value="AWAITING_RELEASE">بانتظار الإفراج</option>
                <option value="COMPLETED">مكتملة</option>
                <option value="DISPUTED">متنازع عليها</option>
                <option value="CANCELLED">ملغاة</option>
                <option value="REFUNDED">مستردة</option>
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
      {loading && (!tasks || tasks.length === 0) ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">جاري تحميل المهام...</span>
        </div>
      ) : (!tasks || tasks.length === 0) ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">لا توجد مهام حاليًا</p>
        </div>
      ) : (
        <div className="space-y-4 relative">
          {/* Loading overlay for pagination/filtering */}
          {loading && tasks && tasks.length > 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>جاري تحميل البيانات...</span>
              </div>
            </div>
          )}
          <div className={!loading ? "" : "opacity-50 pointer-events-none"}>
            {sortedTasks.map((task) => (
              <WorkerOrderCard
                key={task.order_id}
                order={task}
                onViewDetails={(orderId) => window.location.href = `/dashboard/tasks/${orderId}`}
                onStartJob={handleStartJobClick}
                onMarkCompleted={handleMarkAsCompletedClick}
                onInitiateDispute={handleInitiateDisputeClick}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {technicianOrdersPagination.totalPages > 1 && (
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, technicianOrdersPagination.totalPages))}
              disabled={currentPage === technicianOrdersPagination.totalPages || loading}
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
                  {Math.min(currentPage * pageSize, technicianOrdersPagination.count)}
                </span>{' '}
                من <span className="font-medium">{technicianOrdersPagination.count}</span> نتائج
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
                {Array.from({ length: technicianOrdersPagination.totalPages }, (_, i) => i + 1).map((page) => (
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, technicianOrdersPagination.totalPages))}
                  disabled={currentPage === technicianOrdersPagination.totalPages || loading}
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

      {/* Mark as Completed Confirmation Modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد إتمام المهمة</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-right">
            <p>هل أنت متأكد أنك تريد إتمام هذه المهمة؟ سيتم إخطار العميل بانتظار الإفراج عن الأموال.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
              إلغاء
            </Button>
            <Button variant="default" className="bg-green-500 hover:bg-green-600" onClick={handleConfirmMarkAsCompleted}>
              تأكيد الإتمام
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initiate Dispute Modal - Replaced by new component */}
      {/* <Dialog open={showDisputeModal} onOpenChange={setShowDisputeModal}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>فتح نزاع على المهمة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="disputeDescription">وصف تفصيلي</Label>
              <Textarea
                id="disputeDescription"
                placeholder="قدم وصفًا تفصيليًا للمشكلة والنزاع."
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisputeModal(false)}>
              إلغاء
            </Button>
            <Button variant="default" className="bg-orange-500 hover:bg-orange-600" onClick={handleConfirmDispute}>
              تأكيد فتح النزاع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
      
      {/* Use the new InitiateDisputeDialog component */}
      <InitiateDisputeDialog
        isOpen={showDisputeModal}
        onOpenChange={setShowDisputeModal}
        orderId={selectedOrderId}
        onDisputeSuccess={() => dispatch(getTechnicianOrders())}
      />

      {/* Start Job Confirmation Modal */}
      <Dialog open={showStartJobModal} onOpenChange={setShowStartJobModal}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد بدء المهمة</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-right">
            <p>هل أنت متأكد أنك تريد بدء هذه المهمة؟ سيتم تغيير حالة الطلب إلى "قيد التنفيذ".</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartJobModal(false)}>
              إلغاء
            </Button>
            <Button variant="default" className="bg-blue-500 hover:bg-blue-600" onClick={handleConfirmStartJob}>
              تأكيد البدء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
