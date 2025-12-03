import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { DollarSign, PiggyBank, CalendarCheck, Clock } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import api from "../../utils/api"; // Import the API utility

export function WorkerEarnings() {
  const { token } = useSelector((state) => state.auth);
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    pendingEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!token) {
        setError("المستخدم غير مصادق عليه.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await api.get("/technicians/earnings-summary/", {
          headers: { Authorization: `Bearer ${token}` },
        }); // Assuming an endpoint for worker earnings summary
        setEarningsData({
          totalEarnings: data.total_earnings,
          thisMonthEarnings: data.this_month_earnings,
          pendingEarnings: data.pending_earnings,
        });
      } catch (err) {
        setError(err.message || "فشل في جلب بيانات الأرباح.");
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [token]);

  if (loading) return <div className="text-center p-8" dir="rtl">جاري تحميل الأرباح...</div>;
  if (error) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error}</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <DollarSign className="h-7 w-7" />
          <span>الأرباح</span>
        </h1>
        <p className="text-muted-foreground">تتبع دخلك وسجل الدفعات</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">إجمالي الأرباح</p>
              <div className="text-green-600 text-2xl font-bold">${earningsData.totalEarnings}</div>
            </div>
            <PiggyBank className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">هذا الشهر</p>
              <div className="text-green-600 text-2xl font-bold">${earningsData.thisMonthEarnings}</div>
            </div>
            <CalendarCheck className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">معلقة</p>
              <div className="text-yellow-600 text-2xl font-bold">${earningsData.pendingEarnings}</div>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
