import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Briefcase, Eye, CheckCircle, Flag } from "lucide-react"; // Added CheckCircle for completion, Flag for dispute
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
import { markOrderAsCompleted } from "../../redux/orderSlice";
import { initiateDispute } from "../../redux/disputeSlice";

export function WorkerTasks() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");

  useEffect(() => {
    const fetchWorkerTasks = async () => {
      if (!token) {
        setError("المستخدم غير مصادق عليه.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await api.get("/orders/worker-tasks/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(data.results.map(task => {
          return {
            id: task.order_id,
            client: task.client_user?.first_name || task.client_user?.username || "غير متاح",
            clientUserId: task.client_user?.user_id,
            service: task.service?.service_name || "غير متاح",
            location: task.requested_location || "غير متاح",
            date: new Date(task.scheduled_date).toLocaleDateString("ar-EG"),
            amount: `$${task.final_price || 0}`,
            status: task.order_status,
            detailsLink: `/worker-dashboard/tasks/${task.order_id}`,
          };
        }));
      } catch (err) {
        setError(err.message || "فشل في جلب مهام العامل.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerTasks();
  }, [token]);

  const getStatusBadge = (status) => {
    let translatedStatus = status;
    let variant = "default";
    let className = "bg-gray-100 text-gray-800"; // Default

    switch (status) {
      case "OPEN":
      case "PENDING":
        translatedStatus = "معلقة";
        className = "bg-blue-100 text-blue-800";
        break;
      case "ACCEPTED":
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
        translatedStatus = status; // Fallback
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
      await dispatch(markOrderAsCompleted(selectedOrderId));
      setShowCompleteModal(false);
      setSelectedOrderId(null);
      // Re-fetch tasks to update status
      const data = await api.get("/orders/worker-tasks/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(data.results.map(task => ({
        id: task.order_id,
        client: task.client_user?.first_name || task.client_user?.username || "غير متاح",
        clientUserId: task.client_user?.user_id,
        service: task.service?.service_name || "غير متاح",
        location: task.requested_location || "غير متاح",
        date: new Date(task.scheduled_date).toLocaleDateString("ar-EG"),
        amount: `$${task.final_price || 0}`,
        status: task.order_status,
        detailsLink: `/worker-dashboard/tasks/${task.order_id}`,
      })));
    }
  };

  const handleInitiateDisputeClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowDisputeModal(true);
  };

  const handleConfirmDispute = async () => {
    if (selectedOrderId && disputeReason && disputeDescription) {
      await dispatch(initiateDispute({
        order: selectedOrderId,
        reason: disputeReason,
        description: disputeDescription,
      }));
      setShowDisputeModal(false);
      setSelectedOrderId(null);
      setDisputeReason("");
      setDisputeDescription("");
      // Re-fetch tasks to update status
      const data = await api.get("/orders/worker-tasks/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(data.results.map(task => ({
        id: task.order_id,
        client: task.client_user?.first_name || task.client_user?.username || "غير متاح",
        clientUserId: task.client_user?.user_id,
        service: task.service?.service_name || "غير متاح",
        location: task.requested_location || "غير متاح",
        date: new Date(task.scheduled_date).toLocaleDateString("ar-EG"),
        amount: `$${task.final_price || 0}`,
        status: task.order_status,
        detailsLink: `/worker-dashboard/tasks/${task.order_id}`,
      })));
    }
  };


  if (loading) return <div className="text-center p-8" dir="rtl">جاري تحميل المهام...</div>;
  if (error) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error}</div>;

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
                <TableRow key={task.id}>
                  <TableCell>
                    {task.clientUserId ? (
                      <Link to={`/profile/${task.clientUserId}`} className="text-blue-600 hover:underline">
                        {task.client}
                      </Link>
                    ) : (
                      <span>{task.client}</span>
                    )}
                  </TableCell>
                  <TableCell>{task.service}</TableCell>
                  <TableCell>{task.location}</TableCell>
                  <TableCell>{task.date}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{task.amount}</TableCell>
                  <TableCell className="space-x-2 flex">
                    <Button variant="ghost" size="sm" asChild className="flex items-center space-x-2">
                      <Link to={task.detailsLink}>
                        <Eye className="h-4 w-4" />
                        <span>عرض التفاصيل</span>
                      </Link>
                    </Button>
                    {task.status === "IN_PROGRESS" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
                        onClick={() => handleMarkAsCompletedClick(task.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>إتمام المهمة</span>
                      </Button>
                    )}
                    {(task.status === "IN_PROGRESS" || task.status === "AWAITING_RELEASE") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 flex items-center space-x-2"
                        onClick={() => handleInitiateDisputeClick(task.id)}
                      >
                        <Flag className="h-4 w-4" />
                        <span>فتح نزاع</span>
                      </Button>
                    )}
                    {task.status === "DISPUTED" && (
                       <Button variant="outline" size="sm" asChild className="flex items-center space-x-2 border-orange-500 text-orange-500">
                       <Link to={`/disputes/${task.id}`}> {/* Assuming a dispute detail page */}
                         <Flag className="h-4 w-4" />
                         <span>عرض النزاع</span>
                       </Link>
                     </Button>
                    )}
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

      {/* Initiate Dispute Modal */}
      <Dialog open={showDisputeModal} onOpenChange={setShowDisputeModal}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>فتح نزاع على المهمة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="disputeReason">سبب النزاع</Label>
              <Input
                id="disputeReason"
                placeholder="مثال: العميل لا يستجيب، مشكلة في الدفع"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="disputeDescription">وصف تفصيلي</Label>
              <Textarea
                id="disputeDescription"
                placeholder="قدم وصفًا مفصلاً للمشكلة والنزاع."
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
      </Dialog>
    </div>
  );
}
