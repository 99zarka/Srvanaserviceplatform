import React, { useState, useEffect } from "react";
import { 
  Home, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  LayoutDashboard, 
  FileText, 
  Eye, 
  Zap, 
  PlusCircle, 
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  Shield,
  HourglassIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useSelector } from "react-redux";

export function ClientOverview() {
  const { token, user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientDashboardData = async () => {
      if (!token || !user) {
        setError("المستخدم غير مصادق عليه أو بيانات المستخدم مفقودة.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch core dashboard stats from API
        const statsData = await api.get("/dashboard/client/client-summary/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update local stats using data from API response
        setStats([
          { label: "الرصيد المتاح", value: `${parseFloat(statsData.available_balance || 0).toFixed(2)} ج.م`, icon: CreditCard, color: "text-green-600" },
          { label: "في الضمان", value: `${parseFloat(statsData.in_escrow_balance || 0).toFixed(2)} ج.م`, icon: CreditCard, color: "text-blue-600" },
          { label: "الرصيد المعلق", value: `${parseFloat(statsData.pending_balance || 0).toFixed(2)} ج.م`, icon: CreditCard, color: "text-yellow-600" },
          { label: "الطلبات النشطة", value: statsData.active_orders || 0, icon: Clock, color: "text-primary" },
          { label: "المكتملة", value: statsData.completed_orders || 0, icon: CheckCircle, color: "text-green-600" },
          { label: "إجمالي الإنفاق", value: `${statsData.total_spent ? parseFloat(statsData.total_spent).toFixed(2) : '0.00'} ج.م`, icon: CreditCard, color: "text-blue-600" },
        ]);

        // Fetch recent orders
        const requestsData = await api.get("/orders/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentRequests(requestsData.results.slice(0, 4).map(req => ({
          id: req.order_id,
          service: req.service?.arabic_name || req.service?.service_name || "خدمة غير محددة",
          worker: req.associated_offer?.technician_user ? `${req.associated_offer.technician_user.first_name} ${req.associated_offer.technician_user.last_name}` : "لم يتم التعيين بعد",
          technicianId: req.associated_offer?.technician_user?.user_id,
          status: req.order_status,
          date: new Date(req.creation_timestamp).toLocaleDateString("ar-EG"),
          amount: `${req.final_price || req.updated_price ? parseFloat(req.final_price || req.updated_price).toFixed(2) : '0.00'} ج.م`,
        })));
      } catch (err) {
        setError(err.message || "فشل في جلب بيانات لوحة التحكم.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientDashboardData();
  }, [token, user]); // Remove balance dependencies since we're using API data directly

  const getStatusBadge = (status) => {
    const variants = {
      "OPEN": { variant: "default", className: "bg-blue-50 text-blue-700 border-blue-300 font-semibold" },
      "ACCEPTED": { variant: "default", className: "bg-success/10 text-success border-success/30 font-semibold" },
      "IN_PROGRESS": { variant: "default", className: "bg-warning/10 text-warning border-warning/30 font-semibold" },
      "AWAITING_RELEASE": { variant: "default", className: "bg-purple-50 text-purple-700 border-purple-300 font-semibold" },
      "COMPLETED": { variant: "default", className: "bg-success/10 text-success border-success/30 font-semibold" },
      "DISPUTED": { variant: "default", className: "bg-orange-50 text-orange-700 border-orange-300 font-semibold" },
      "CANCELLED": { variant: "default", className: "bg-danger/10 text-danger border-danger/30 font-semibold" },
      "REFUNDED": { variant: "default", className: "bg-danger/20 text-danger border-danger/40 font-semibold" },
      "AWAITING_TECHNICIAN_RESPONSE": { variant: "default", className: "bg-neutral-100 text-neutral-700 border-neutral-300 font-semibold" },
      "AWAITING_CLIENT_ESCROW_CONFIRMATION": { variant: "default", className: "bg-warning/10 text-warning border-warning/30 font-semibold" },
      // Arabic translations
      "مفتوحة": { variant: "default", className: "bg-blue-50 text-blue-700 border-blue-300 font-semibold" },
      "مقبولة": { variant: "default", className: "bg-success/10 text-success border-success/30 font-semibold" },
      "قيد التنفيذ": { variant: "default", className: "bg-warning/10 text-warning border-warning/30 font-semibold" },
      "بانتظار الإفراج": { variant: "default", className: "bg-purple-50 text-purple-700 border-purple-300 font-semibold" },
      "مكتملة": { variant: "default", className: "bg-success/10 text-success border-success/30 font-semibold" },
      "متنازع عليها": { variant: "default", className: "bg-orange-50 text-orange-700 border-orange-300 font-semibold" },
      "ملغاة": { variant: "default", className: "bg-danger/10 text-danger border-danger/30 font-semibold" },
      "مستردة": { variant: "default", className: "bg-danger/20 text-danger border-danger/40 font-semibold" },
      "بانتظار رد الفني": { variant: "default", className: "bg-neutral-100 text-neutral-700 border-neutral-300 font-semibold" },
      "بانتظار تأكيد العميل للدفع": { variant: "default", className: "bg-warning/10 text-warning border-warning/30 font-semibold" },
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
    const config = variants[status] || { variant: "default", className: "bg-neutral-100 text-neutral-700 border-neutral-300 font-semibold" };
    return <Badge variant="outline" className={config.className}>{translatedStatus}</Badge>;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50" dir="rtl">
      <div className="text-center">
        <div className="inline-block w-12 h-12 mb-4 border-4 rounded-full animate-spin border-primary border-t-accent"></div>
        <p className="text-lg text-neutral-600">جاري تحميل لوحة التحكم...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50" dir="rtl">
      <Card className="max-w-md border-danger">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full text-danger bg-danger/10">
              <span className="text-2xl">⚠</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-neutral-800">خطأ في التحميل</h3>
            <p className="text-danger">{error}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-neutral-50" dir="rtl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-primary rounded-xl">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-primary">نظرة عامة على لوحة التحكم</h1>
            <p className="mt-1 text-lg text-neutral-600">مرحبًا بعودتك! إليك ما يحدث مع طلباتك</p>
          </div>
        </div>
        <div className="w-32 h-1 rounded-full bg-gradient-to-r from-accent to-accent/30"></div>
      </div>

      {/* Balances and Stats */}
      <div className="grid gap-6 mb-8 lg:grid-cols-3 md:grid-cols-2">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label}
            className="relative overflow-hidden transition-all duration-300 border-0 shadow-lg hover:shadow-xl group"
          >
            {/* Accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor}`}></div>
            
            <CardContent className="pt-6 pb-6">
              {/* Icon and Value Row */}
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon && <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-neutral-800">{stat.value}</div>
                </div>
              </div>
              
              {/* Label */}
              <p className="text-sm font-medium text-neutral-600">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>



      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>طلبات الخدمة الأخيرة</span>
            </CardTitle>
            <Button variant="outline" asChild className="flex items-center space-x-2">
              <Link to="/dashboard/orders-offers">
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
                    <TableCell>{request.service}</TableCell><TableCell>
                      {request.worker && request.technicianId ? (
                        <Link to={`/profile/${request.technicianId}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                          {request.worker}
                        </Link>
                      ) : (
                        "غير متاح"
                      )}
                    </TableCell><TableCell>{request.date}</TableCell><TableCell>{getStatusBadge(request.status)}</TableCell><TableCell>{request.amount}</TableCell>
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
      <Card className="border-0 shadow-lg">
        <CardHeader className="p-6 border-b bg-neutral-100 border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <Zap className="w-5 h-5 text-accent-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-neutral-800">إجراءات سريعة</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              className="py-6 text-lg font-semibold text-white transition-all duration-300 shadow-lg bg-primary hover:bg-primary-600 hover:shadow-xl group"
              asChild
            >
              <Link to="/order/create" className="flex items-center justify-center gap-3">
                <PlusCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
                <span>طلب خدمة جديدة</span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              asChild 
              className="py-6 text-lg font-semibold transition-all duration-300 border-2 shadow-md border-primary/30 hover:bg-primary/5 hover:border-primary hover:shadow-lg group"
            >
              <Link to="/dashboard/messages" className="flex items-center justify-center gap-3">
                <MessageSquare className="w-6 h-6 transition-transform group-hover:scale-110" />
                <span>عرض الرسائل</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
