import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Flag, Eye } from "lucide-react";
import { getClientOrders } from "../../redux/orderSlice";
import { useGetDisputesQuery } from "../../redux/disputeSlice";

export function ClientDisputes() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { clientOrders, loading: ordersLoading, error: ordersError } = useSelector((state) => state.orders);
  // Use RTK Query hook for disputes
  const { data: disputesData, isLoading: disputesLoading, error: disputesError } = useGetDisputesQuery(undefined, {
    skip: !token
  });

  // Filter disputes to only show those related to the client's orders
  const [filteredDisputes, setFilteredDisputes] = useState([]);

  useEffect(() => {
    if (token) {
      dispatch(getClientOrders());
    }
  }, [token, dispatch]);

  useEffect(() => {
    // Handle both paginated (with results) and direct array responses
    let disputesArray = [];
    if (disputesData) {
      if (Array.isArray(disputesData)) {
        disputesArray = disputesData;
      } else if (disputesData.results && Array.isArray(disputesData.results)) {
        disputesArray = disputesData.results;
      } else if (disputesData.results !== undefined) {
        // If results exists but is not an array, handle gracefully
        disputesArray = Array.isArray(disputesData.results) ? disputesData.results : [];
      }
    }

    if (disputesArray.length > 0 && clientOrders.length > 0) {
      // Filter disputes to only show those related to the client's orders
      const clientOrderIds = new Set(clientOrders.map(order => order.id));
      const filtered = disputesArray.filter(dispute =>
        clientOrderIds.has(dispute.order?.id)
      );
      setFilteredDisputes(filtered);
    } else if (clientOrders.length === 0 && !ordersLoading && !ordersError) {
      setFilteredDisputes([]); // No orders, no disputes
    } else if (disputesArray.length === 0) {
      setFilteredDisputes([]);
    }
  }, [disputesData, clientOrders, ordersLoading, ordersError]);

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
 if (ordersError || disputesError) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {ordersError || disputesError?.message || disputesError}</div>;

  if (filteredDisputes.length === 0) {
    return <div className="text-center p-8" dir="rtl">لا توجد نزاعات حاليًا.</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <Flag className="h-7 w-7" />
          <span>نزاعاتي</span>
        </h1>
        <p className="text-muted-foreground">إدارة النزاعات المتعلقة بطلباتك</p>
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
              {filteredDisputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell>{dispute.id}</TableCell>
                  <TableCell>
                    <Link to={`/orders/dashboard?orderId=${dispute.order?.id}`} className="text-blue-600 hover:underline">
                      #{dispute.order?.id}
                    </Link>
                  </TableCell>
                  <TableCell>{dispute.reason}</TableCell>
                  <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                  <TableCell>{new Date(dispute.created_at).toLocaleDateString("ar-EG")}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild className="flex items-center space-x-2">
                      <Link to={`/disputes/${dispute.order?.id}`}>
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
