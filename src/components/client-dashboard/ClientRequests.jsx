import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { FileText, Eye } from "lucide-react";
import { getClientOrders } from "../../redux/orderSlice";
import { Link } from "react-router-dom";

export function ClientRequests() {
  const dispatch = useDispatch();
  const { clientOrders, loading, error } = useSelector((state) => state.orders);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getClientOrders());
    }
  }, [dispatch, token]);

  const getStatusBadge = (status) => {
    const variants = {
      "OPEN": { variant: "default", className: "bg-blue-100 text-blue-800" },
      "ACCEPTED": { variant: "default", className: "bg-green-100 text-green-800" },
      "IN_PROGRESS": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "AWAITING_RELEASE": { variant: "default", className: "bg-purple-100 text-purple-800" },
      "COMPLETED": { variant: "default", className: "bg-green-100 text-green-800" },
      "DISPUTED": { variant: "default", className: "bg-orange-100 text-orange-800" },
      "CANCELLED": { variant: "default", className: "bg-red-100 text-red-800" },
      "REFUNDED": { variant: "default", className: "bg-red-200 text-red-900" },
      "AWAITING_TECHNICIAN_RESPONSE": { variant: "default", className: "bg-gray-200 text-gray-800" },
      "AWAITING_CLIENT_ESCROW_CONFIRMATION": { variant: "default", className: "bg-yellow-200 text-yellow-800" },
      // Arabic translations
      "مفتوحة": { variant: "default", className: "bg-blue-100 text-blue-800" },
      "مقبولة": { variant: "default", className: "bg-green-100 text-green-800" },
      "قيد التنفيذ": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "بانتظار الإفراج": { variant: "default", className: "bg-purple-100 text-purple-800" },
      "مكتملة": { variant: "default", className: "bg-green-100 text-green-800" },
      "متنازع عليها": { variant: "default", className: "bg-orange-100 text-orange-800" },
      "ملغاة": { variant: "default", className: "bg-red-100 text-red-800" },
      "مستردة": { variant: "default", className: "bg-red-200 text-red-900" },
      "بانتظار رد الفني": { variant: "default", className: "bg-gray-200 text-gray-800" },
      "بانتظار تأكيد العميل للدفع": { variant: "default", className: "bg-yellow-200 text-yellow-800" },
    };

    let translatedStatus = status;
    switch (status) {
      case "OPEN":
        translatedStatus = "مفتوحة";
        break;
      case "ACCEPTED":
        translatedStatus = "مقبولة";
        break;
      case "IN_PROGRESS":
        translatedStatus = "قيد التنفيذ";
        break;
      case "AWAITING_RELEASE":
        translatedStatus = "بانتظار الإفراج";
        break;
      case "COMPLETED":
        translatedStatus = "مكتملة";
        break;
      case "DISPUTED":
        translatedStatus = "متنازع عليها";
        break;
      case "CANCELLED":
        translatedStatus = "ملغاة";
        break;
      case "REFUNDED":
        translatedStatus = "مستردة";
        break;
      case "AWAITING_TECHNICIAN_RESPONSE":
        translatedStatus = "بانتظار رد الفني";
        break;
      case "AWAITING_CLIENT_ESCROW_CONFIRMATION":
        translatedStatus = "بانتظار تأكيد العميل للدفع";
        break;
      default:
        translatedStatus = status;
    }
    const config = variants[status] || { variant: "default", className: "bg-gray-100 text-gray-800" };
    return <Badge variant={config.variant} className={config.className}>{translatedStatus}</Badge>;
  };

  if (loading) return <div className="text-center p-8" dir="rtl">جاري تحميل الطلبات...</div>;
  if (error) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error}</div>;

  if (!clientOrders || clientOrders.length === 0) {
    return <div className="text-center p-8" dir="rtl">لا توجد طلبات خدمة حاليًا.</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <FileText className="h-7 w-7" />
          <span>طلبات خدمتي</span>
        </h1>
        <p className="text-muted-foreground">تتبع وإدارة جميع طلبات خدمتك</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الخدمة</TableHead>
                <TableHead>العامل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientOrders.map((request) => (
                <TableRow key={request.order_id}>
                  <TableCell>{request.service?.service_name || 'غير متاح'}</TableCell>
                  <TableCell>{request.technician_user?.first_name || "غير متاح"}</TableCell>
                  <TableCell>{new Date(request.creation_timestamp).toLocaleDateString("ar-EG")}</TableCell>
                  <TableCell>{getStatusBadge(request.order_status)}</TableCell>
                  <TableCell>${request.budget || 0}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild className="flex items-center space-x-2">
                      <Link to={`/dashboard/requests/${request.order_id}`}>
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
