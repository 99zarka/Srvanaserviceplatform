import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { FileText, Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { getAdminOrders } from "../../redux/orderSlice";

export function AdminOrders() {
  const dispatch = useDispatch();
  const { adminOrders, adminOrdersPagination, loading } = useSelector((state) => state.orders);
  const [page, setPage] = useState(1);

  // Calculate total orders from pagination
  const totalOrders = adminOrdersPagination.count || 0;

  useEffect(() => {
    dispatch(getAdminOrders({ page, pageSize: 10 }));
  }, [dispatch, page]);

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(adminOrdersPagination.totalPages, prev + 1));
  };

  const getOrderStatusBadge = (status) => {
    const statusMap = {
      "OPEN": "مفتوحة",
      "PENDING": "معلقة",
      "ACCEPTED": "مقبولة",
      "IN_PROGRESS": "قيد التنفيذ",
      "AWAITING_RELEASE": "بانتظار الإفراج",
      "COMPLETED": "مكتملة",
      "DISPUTED": "متنازع عليها",
      "CANCELLED": "ملغاة",
      "REFUNDED": "مستردة",
      "AWAITING_TECHNICIAN_RESPONSE": "في انتظار رد الفني",
      "AWAITING_CLIENT_ESCROW_CONFIRMATION": "بانتظار تأكيد العميل للدفع"
    };
    const displayStatus = statusMap[status] || status;
    const colorClasses = {
      "OPEN": "border-blue-300 text-blue-700 bg-blue-50",
      "PENDING": "border-yellow-300 text-yellow-700 bg-yellow-50",
      "ACCEPTED": "border-green-300 text-green-700 bg-green-50",
      "IN_PROGRESS": "border-orange-300 text-orange-700 bg-orange-50",
      "AWAITING_RELEASE": "border-cyan-300 text-cyan-700 bg-cyan-50",
      "COMPLETED": "border-green-300 text-green-700 bg-green-50",
      "DISPUTED": "border-purple-300 text-purple-700 bg-purple-50",
      "CANCELLED": "border-red-300 text-red-700 bg-red-50",
      "REFUNDED": "border-gray-300 text-gray-700 bg-gray-50",
      "AWAITING_TECHNICIAN_RESPONSE": "border-amber-300 text-amber-700 bg-amber-50",
      "AWAITING_CLIENT_ESCROW_CONFIRMATION": "border-cyan-300 text-cyan-700 bg-cyan-50"
    };
    return (
      <Badge variant="outline" className={colorClasses[status] || "border-gray-300 text-gray-700 bg-gray-50"}>
        {displayStatus}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center space-x-2">
            <FileText className="h-7 w-7" />
            <span>إدارة المشاريع</span>
          </h1>
          <p className="text-muted-foreground">إدارة جميع مشاريع المنصة</p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center p-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-accent mb-4"></div>
              <p className="text-neutral-600 text-lg">جاري تحميل المشاريع...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>الخدمة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminOrders.length > 0 ? (
                    adminOrders.map((order) => (
                      <TableRow key={order.order_id}>
                        <TableCell className="font-medium">
                          #{order.order_id}
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/profile/${order.client_user?.user_id}`}
                            className="text-secondary hover:underline"
                          >
                            {`${order.client_user?.first_name || ""} ${order.client_user?.last_name || ""}`.trim() || order.client_user?.username || "غير متاح"}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            {order.service?.arabic_name || order.service?.service_name || "خدمة غير محددة"}
                          </Badge>
                        </TableCell>
                        <TableCell>{getOrderStatusBadge(order.order_status)}</TableCell>
                        <TableCell>{formatDate(order.creation_timestamp)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="border-primary/30 hover:bg-primary/5"
                            >
                              <Link to={`/dashboard/orders-offers/view/${order.order_id}`} className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>عرض</span>
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="border-secondary/30 hover:bg-secondary/5"
                            >
                              <Link to={`/dashboard/orders-offers/edit/${order.order_id}`} className="flex items-center gap-1">
                                <Edit className="h-4 w-4" />
                                <span>تعديل</span>
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        لا توجد طلبات لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  عرض {adminOrders.length} من {totalOrders} مشروع
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={page === 1}>
                    <ChevronRight className="h-4 w-4 mr-2" />
                    <span>السابق</span>
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, adminOrdersPagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(adminOrdersPagination.totalPages - 4, adminOrdersPagination.currentPage - 2)) + i;
                      if (pageNum > adminOrdersPagination.totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === adminOrdersPagination.currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page === adminOrdersPagination.totalPages}>
                    <span>التالي</span>
                    <ChevronLeft className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
