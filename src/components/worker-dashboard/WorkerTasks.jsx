import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Briefcase, Eye, CheckCircle, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { markJobDone, initiateDispute, getTechnicianOrders, startJob } from "../../redux/orderSlice";
import { toast } from "sonner";
import { InitiateDisputeDialog } from "../disputes/InitiateDisputeDialog"; // Import the new component

export function WorkerTasks() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { technicianOrders: tasks, loading, error } = useSelector((state) => state.orders);
  
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showStartJobModal, setShowStartJobModal] = useState(false); // New state for start job modal
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [disputeReason, setDisputeReason] = useState(""); // This can be removed if not used elsewhere
  // The following state and handler are now handled by InitiateDisputeDialog
  // const [disputeDescription, setDisputeDescription] = useState(""); 

  useEffect(() => {
    if (token) {
      dispatch(getTechnicianOrders());
    }
  }, [token, dispatch]);

  // Debugging logs
  console.log("WorkerTasks - tasks:", tasks);
  console.log("WorkerTasks - loading:", loading);
  console.log("WorkerTasks - error:", error);

  const getStatusBadge = (status) => {
    let translatedStatus = status;
    let variant = "default";
    let className = "bg-gray-100 text-gray-800";

    switch (status) {
      case "OPEN":
      case "PENDING":
        translatedStatus = "معلقة";
        className = "bg-blue-100 text-blue-800";
        break;
      case "ACCEPTED":
        translatedStatus = "مقبولة";
        className = "bg-green-100 text-green-800";
        break;
      case "IN_PROGRESS":
        translatedStatus = "قيد التنفيذ";
        className = "bg-yellow-100 text-yellow-800";
        break;
      case "AWAITING_RELEASE":
        translatedStatus = "بانتظار الإفراج";
        className = "bg-purple-100 text-purple-800";
        break;
      case "COMPLETED":
        translatedStatus = "مكتملة";
        className = "bg-green-100 text-green-800";
        break;
      case "DISPUTED":
        translatedStatus = "متنازع عليها";
        className = "bg-orange-100 text-orange-800";
        break;
      case "CANCELLED":
        translatedStatus = "ملغاة";
        className = "bg-red-100 text-red-800";
        break;
      case "REFUNDED":
        translatedStatus = "تم استرداد المبلغ";
        className = "bg-red-200 text-red-900";
        break;
      default:
        translatedStatus = status;
        break;
    }
    return <Badge variant={variant} className={className}>{translatedStatus}</Badge>;
  };

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

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <Briefcase className="h-7 w-7" />
          <span>مهامي</span>
        </h1>
        <p className="text-muted-foreground">إدارة مهامك المجدولة والنشطة</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العميل</TableHead>
                <TableHead>الخدمة</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.order_id}>
                  <TableCell>
                    {task.client_user?.user_id ? (
                      <Link to={`/profile/${task.client_user.user_id}`} className="text-blue-600 hover:underline">
                        {task.client_user.first_name || task.client_user.username}
                      </Link>
                    ) : (
                      <span>{task.client_user?.username || 'N/A'}</span>
                    )}
                  </TableCell>
                  <TableCell>{task.service.arabic_name}</TableCell>
                  <TableCell>{task.requested_location}</TableCell>
                  <TableCell>{task.scheduled_date}</TableCell>
                  <TableCell>{getStatusBadge(task.order_status)}</TableCell>
                  <TableCell>{task.final_price}</TableCell>
                  <TableCell className="space-x-2 flex">
                    <> {/* Added Fragment here */}
                      <Button variant="ghost" size="sm" asChild className="flex items-center space-x-2">
                        <Link to={`/dashboard/tasks/${task.order_id}`}>
                          <Eye className="h-4 w-4" />
                          <span>عرض التفاصيل</span>
                        </Link>
                      </Button>
                      {task.order_status === "ACCEPTED" && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
                          onClick={() => handleStartJobClick(task.order_id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>بدء المهمة</span>
                        </Button>
                      )}
                      {task.order_status === "IN_PROGRESS" && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
                          onClick={() => handleMarkAsCompletedClick(task.order_id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>إتمام المهمة</span>
                        </Button>
                      )}
                      {(task.order_status === "IN_PROGRESS" || task.order_status === "AWAITING_RELEASE") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 flex items-center space-x-2"
                          onClick={() => handleInitiateDisputeClick(task.order_id)}
                        >
                          <Flag className="h-4 w-4" />
                          <span>فتح نزاع</span>
                        </Button>
                      )}
                      {task.order_status === "DISPUTED" && (
                         <Button variant="outline" size="sm" asChild className="flex items-center space-x-2 border-orange-500 text-orange-500">
                         <Link to={`/dashboard/disputes/${task.order_id}`}>
                           <Flag className="h-4 w-4" />
                           <span>عرض النزاع</span>
                         </Link>
                       </Button>
                      )}
                    </> {/* Closed Fragment here */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
