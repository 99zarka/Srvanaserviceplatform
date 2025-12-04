import React, { useState, useEffect } from "react";
import { Home, CreditCard, CheckCircle, Clock, LayoutDashboard, FileText, Eye, Zap, PlusCircle, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Link } from "react-router-dom";
import api from "../../utils/api"; // Import the API utility
import { useSelector } from "react-redux"; // To get user token

export function ClientOverview() {
  const { token, user } = useSelector((state) => state.auth); // Get token and user from Redux state
  const [stats, setStats] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientDashboardData = async () => {
      if (!token || !user) { // Check for user existence as well
        setError("المستخدم غير مصادق عليه أو بيانات المستخدم مفقودة.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch stats from correct dashboard endpoint
        const statsData = await api.get("/dashboard/client/client-summary/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Combine dashboard stats with user balance info
        setStats([
          { label: "الرصيد المتاح", value: `$${user.available_balance || '0.00'}`, icon: CreditCard, color: "text-green-600" },
          { label: "في الضمان", value: `$${user.in_escrow_balance || '0.00'}`, icon: CreditCard, color: "text-blue-600" },
          { label: "الرصيد المعلق", value: `$${user.pending_balance || '0.00'}`, icon: CreditCard, color: "text-yellow-600" },
          { label: "الطلبات النشطة", value: statsData.active_orders || 0, icon: Clock, color: "text-primary" },
          { label: "المكتملة", value: statsData.completed_orders || 0, icon: CheckCircle, color: "text-green-600" },
          { label: "إجمالي الإنفاق", value: `$${statsData.total_spent || 0}`, icon: CreditCard, color: "text-blue-600" },
        ]);

        // Fetch recent orders from correct endpoint
        const requestsData = await api.get("/orders/", {
          headers: { Authorization: `Bearer ${token}` },
        }); 
        setRecentRequests(requestsData.results.slice(0, 4).map(req => ({
          id: req.order_id,
          service: req.service || "خدمة غير محددة",
          worker: req.technician_user || "لم يتم التعيين بعد",
          status: req.order_status,
          date: new Date(req.creation_timestamp).toLocaleDateString("ar-EG"),
          amount: `$${req.final_price || req.updated_price || 0}`,
        })));
      } catch (err) {
        setError(err.message || "فشل في جلب بيانات لوحة التحكم.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientDashboardData();
  }, [token, user]); // Add user to dependency array to re-fetch if user data changes


  const getStatusBadge = (status) => {
    const variants = {
      "pending": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "accepted": { variant: "default", className: "bg-blue-100 text-blue-800" },
      "completed": { variant: "default", className: "bg-green-100 text-green-800" },
      "cancelled": { variant: "default", className: "bg-red-100 text-red-800" },
      "قيد التنفيذ": { variant: "default", className: "bg-blue-100 text-blue-800" }, // For static data fallback
      "مكتملة": { variant: "default", className: "bg-green-100 text-green-800" }, // For static data fallback
      "معلقة": { variant: "default", className: "bg-yellow-100 text-yellow-800" }, // For static data fallback
      "ملغاة": { variant: "default", className: "bg-red-100 text-red-800" }, // For static data fallback
    };
    const config = variants[status] || { variant: "default", className: "bg-gray-100 text-gray-800" };
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  if (loading) return <div className="text-center py-20" dir="rtl">جاري تحميل لوحة التحكم...</div>;
  if (error) return <div className="text-center py-20 text-red-500" dir="rtl">خطأ: {error}</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <LayoutDashboard className="h-7 w-7" />
          <span>نظرة عامة على لوحة التحكم</span>
        </h1>
        <p className="text-muted-foreground">مرحبًا بعودتك! إليك ما يحدث مع طلباتك.</p>
      </div>
      
      {/* Balances and Stats */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">{stat.label}</p>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
                {stat.icon && <stat.icon className={`h-8 w-8 ${stat.color}`} />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>طلبات الخدمة الأخيرة</span>
            </CardTitle>
            <Button variant="outline" asChild className="flex items-center space-x-2">
              <Link to="/client-dashboard/requests">
                <Eye className="h-4 w-4" />
                <span>عرض الكل</span>
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الخدمة</TableHead>
                <TableHead>العامل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المبلغ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.service}</TableCell><TableCell>{request.worker || "غير متاح"}</TableCell><TableCell>{request.date}</TableCell><TableCell>{getStatusBadge(request.status)}</TableCell><TableCell>{request.amount}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">لا توجد طلبات حديثة.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>إجراءات سريعة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2"
              asChild
            >
              <Link to="/services">
                <PlusCircle className="h-5 w-5" />
                <span>طلب خدمة جديدة</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex items-center space-x-2">
              <Link to="/client-dashboard/messages">
                <MessageSquare className="h-5 w-5" />
                <span>عرض الرسائل</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
