import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { DollarSign, PiggyBank, Clock, Banknote } from "lucide-react"; // Changed CalendarCheck to Banknote
import { Card, CardContent } from "../ui/card";
import api from "../../utils/api"; // Import the API utility

export function WorkerEarnings() {
  const { token, user } = useSelector((state) => state.auth); // Get token and user from Redux state
  const [dashboardStats, setDashboardStats] = useState([]); // Renamed earningsData to dashboardStats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkerDashboardData = async () => { // Renamed fetchEarningsData
      if (!token || !user) { // Check for user existence as well
        setError("المستخدم غير مصادق عليه أو بيانات المستخدم مفقودة.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch stats from correct dashboard endpoint (or use user object directly)
        // For now, we will use user object for balances and keep the existing earnings summary for other stats if any
        const data = await api.get("/technicians/earnings-summary/", { // Keeping this for other potential worker-specific stats
          headers: { Authorization: `Bearer ${token}` },
        });

        // Combine dashboard stats with user balance info
        setDashboardStats([
          { label: "الرصيد المتاح", value: `$${user.available_balance || '0.00'}`, icon: Banknote, color: "text-green-600" },
          { label: "في الضمان", value: `$${user.in_escrow_balance || '0.00'}`, icon: PiggyBank, color: "text-blue-600" },
          { label: "الرصيد المعلق", value: `$${user.pending_balance || '0.00'}`, icon: Clock, color: "text-yellow-600" },
          { label: "إجمالي الأرباح", value: `$${data.total_earnings || '0.00'}`, icon: DollarSign, color: "text-green-600" },
          { label: "أرباح هذا الشهر", value: `$${data.this_month_earnings || '0.00'}`, icon: DollarSign, color: "text-green-600" },
        ]);

      } catch (err) {
        setError(err.message || "فشل في جلب بيانات لوحة التحكم."); // Updated error message
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerDashboardData(); // Call the renamed function
  }, [token, user]); // Add user to dependency array to re-fetch if user data changes

  if (loading) return <div className="text-center p-8" dir="rtl">جاري تحميل الأرباح...</div>;
  if (loading) return <div className="text-center p-8" dir="rtl">جاري تحميل الأرباح...</div>;
  if (error) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error}</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <DollarSign className="h-7 w-7" />
          <span>الأرباح والرصيد</span>
        </h1>
        <p className="text-muted-foreground">تتبع دخلك ورصيدك الحالي.</p>
      </div>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
        {dashboardStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-2">{stat.label}</p>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
              {stat.icon && <stat.icon className={`h-8 w-8 ${stat.color}`} />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
