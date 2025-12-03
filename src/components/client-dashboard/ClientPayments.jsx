import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CreditCard } from "lucide-react";
import api from "../../utils/api"; // Import the API utility
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

export function ClientPayments() {
  const { token } = useSelector((state) => state.auth);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!token) {
        setError("المستخدم غير مصادق عليه.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await api.get("/payments/", {
          headers: { Authorization: `Bearer ${token}` },
        }); // Assuming "/payments/" is your backend endpoint
        setPayments(data.results.map(payment => ({
          id: payment.id,
          amount: `$${payment.amount}`,
          type: payment.payment_type,
          status: payment.status,
          date: new Date(payment.timestamp).toLocaleDateString("ar-EG"),
        })));
      } catch (err) {
        setError(err.message || "فشل في جلب سجل الدفعات.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [token]);

  const getStatusBadge = (status) => {
    const variants = {
      "completed": { variant: "default", className: "bg-green-100 text-green-800" },
      "pending": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "failed": { variant: "default", className: "bg-red-100 text-red-800" },
      "مكتملة": { variant: "default", className: "bg-green-100 text-green-800" }, // For static data fallback
      "معلقة": { variant: "default", className: "bg-yellow-100 text-yellow-800" }, // For static data fallback
      "فاشلة": { variant: "default", className: "bg-red-100 text-red-800" }, // For static data fallback
    };
    let translatedStatus = status;
    switch (status) {
      case "completed":
        translatedStatus = "مكتملة";
        break;
      case "pending":
        translatedStatus = "معلقة";
        break;
      case "failed":
        translatedStatus = "فاشلة";
        break;
    }
    const config = variants[status] || { variant: "default", className: "bg-gray-100 text-gray-800" };
    return <Badge variant={config.variant} className={config.className}>{translatedStatus}</Badge>;
  };

  if (loading) return <div className="text-center p-8" dir="rtl">جاري تحميل سجل الدفعات...</div>;
  if (error) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error}</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <CreditCard className="h-7 w-7" />
          <span>سجل الدفعات</span>
        </h1>
        <p className="text-muted-foreground">عرض معاملات الدفع الخاصة بك</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {payments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              لا توجد دفعات مسجلة حتى الآن.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>{payment.type}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
