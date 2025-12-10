import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Flag, Eye } from "lucide-react";
import { getTechnicianOrders } from "../../redux/orderSlice";
import { getOrderDisputes } from "../../redux/disputeSlice";

export function WorkerDisputes() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { technicianOrders, loading: ordersLoading, error: ordersError } = useSelector((state) => state.orders);
  // Using a local state for disputes as getOrderDisputes is called per order,
  // and we want to aggregate them here.
  const [allDisputes, setAllDisputes] = useState([]);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [disputesError, setDisputesError] = useState(null);

  useEffect(() => {
    if (token) {
      dispatch(getTechnicianOrders());
    }
  }, [token, dispatch]);

  useEffect(() => {
    const fetchAllDisputes = async () => {
      if (technicianOrders.length > 0 && token) {
        setDisputesLoading(true);
        setDisputesError(null);
        let fetchedDisputes = [];
        for (const order of technicianOrders) {
          try {
            const result = await dispatch(getOrderDisputes(order.id)).unwrap();
            // Assuming result is an array of disputes or has a results property
            const disputesForOrder = result.results || result; 
            fetchedDisputes = fetchedDisputes.concat(disputesForOrder);
          } catch (err) {
            console.error(`Failed to fetch disputes for order ${order.id}:`, err);
            setDisputesError(err.message || "فشل في جلب بعض النزاعات.");
          }
        }
        // Ensure uniqueness if the same dispute could be returned by different means
        const uniqueDisputes = Array.from(new Map(fetchedDisputes.map(d => [d.id, d])).values());
        setAllDisputes(uniqueDisputes);
        setDisputesLoading(false);
      } else if (technicianOrders.length === 0 && !ordersLoading && !ordersError) {
        setAllDisputes([]); // No orders, no disputes
        setDisputesLoading(false);
      }
    };

    fetchAllDisputes();
  }, [technicianOrders, token, dispatch, ordersLoading, ordersError]);

  const getStatusBadge = (status) => {
    let translatedStatus = status;
    let className = "bg-gray-100 text-gray-800"; // Default

    switch (status) {
      case "OPEN":
        translatedStatus = "مفتوح";
        className = "bg-blue-100 text-blue-800";
        break;
      case "IN_REVIEW":
        translatedStatus = "قيد المراجعة";
        className = "bg-yellow-100 text-yellow-800";
        break;
      case "RESOLVED":
        translatedStatus = "تم حل النزاع";
        className = "bg-green-100 text-green-800";
        break;
      case "CLOSED":
        translatedStatus = "مغلق";
        className = "bg-red-100 text-red-800";
        break;
      default:
        translatedStatus = status;
        break;
    }
    return <Badge className={className}>{translatedStatus}</Badge>;
  };

  if (ordersLoading || disputesLoading) return <div className="text-center p-8" dir="rtl">جاري تحميل النزاعات...</div>;
  if (ordersError || disputesError) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {ordersError || disputesError}</div>;

  if (allDisputes.length === 0) {
    return <div className="text-center p-8" dir="rtl">لا توجد نزاعات حاليًا.</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <Flag className="h-7 w-7" />
          <span>نزاعاتي</span>
        </h1>
        <p className="text-muted-foreground">إدارة النزاعات المتعلقة بمهامك</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>معرف النزاع</TableHead>
                <TableHead>معرف الطلب</TableHead>
                <TableHead>السبب</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allDisputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell>{dispute.id}</TableCell>
                  <TableCell>
                    <Link to={`/dashboard/tasks/${dispute.order.id}`} className="text-blue-600 hover:underline">
                      #{dispute.order.id}
                    </Link>
                  </TableCell>
                  <TableCell>{dispute.reason}</TableCell>
                  <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                  <TableCell>{new Date(dispute.created_at).toLocaleDateString("ar-EG")}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild className="flex items-center space-x-2">
                      <Link to={`/disputes/${dispute.id}`}>
                        <Eye className="h-4 w-4" />
                        <span>عرض التفاصيل</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
