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
import BalanceDisplayAndTransfer from "../common/BalanceDisplayAndTransfer";

export function ClientOverview() {
  const { token, user } = useSelector((state) => state.auth);
  const { userBalances } = useSelector((state) => state.payments); // Get userBalances from paymentSlice
  const [stats, setStats] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract balances from Redux state for display
  const available_balance = parseFloat(userBalances.available_balance) || 0;
  const in_escrow_balance = parseFloat(userBalances.in_escrow_balance) || 0;
  const pending_balance = parseFloat(userBalances.pending_balance) || 0;

  useEffect(() => {
    const fetchClientDashboardData = async () => {
      if (!token || !user) {
        setError("المستخدم غير مصادق عليه أو بيانات المستخدم مفقودة.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch core dashboard stats (excluding balances, which come from Redux)
        const statsData = await api.get("/dashboard/client/client-summary/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update local stats, explicitly using balances from Redux state
        setStats([
          { 
            label: "الرصيد المتاح", 
            value: `${available_balance.toFixed(2)} ج.م`, 
            icon: Wallet, 
            bgColor: "bg-success/10",
            iconColor: "text-success",
            accentColor: "bg-success"
          },
          { 
            label: "في الضمان", 
            value: `${in_escrow_balance.toFixed(2)} ج.م`, 
            icon: Shield, 
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
            accentColor: "bg-blue-500"
          },
          { 
            label: "الرصيد المعلق", 
            value: `${pending_balance.toFixed(2)} ج.م`, 
            icon: HourglassIcon, 
            bgColor: "bg-warning/10",
            iconColor: "text-warning",
            accentColor: "bg-warning"
          },
          { 
            label: "الطلبات النشطة", 
            value: statsData.active_orders || 0, 
            icon: Clock, 
            bgColor: "bg-primary/10",
            iconColor: "text-primary",
            accentColor: "bg-primary"
          },
          { 
            label: "المكتملة", 
            value: statsData.completed_orders || 0, 
            icon: CheckCircle, 
            bgColor: "bg-success/10",
            iconColor: "text-success",
            accentColor: "bg-success"
          },
          { 
            label: "إجمالي الإنفاق", 
            value: `${statsData.total_spent ? parseFloat(statsData.total_spent).toFixed(2) : '0.00'} ج.م`, 
            icon: TrendingUp, 
            bgColor: "bg-accent/10",
            iconColor: "text-accent-600",
            accentColor: "bg-accent"
          },
        ]);

        // Fetch recent orders
        const requestsData = await api.get("/orders/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentRequests(requestsData.results.slice(0, 4).map(req => ({
          id: req.order_id,
          service: req.service?.arabic_name || req.service?.service_name || "خدمة غير محددة",
          worker: req.associated_offer?.technician_user ? `${req.associated_offer.technician_user.first_name} ${req.associated_offer.technician_user.last_name}` : "لم يتم التعيين بعد",
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
  }, [token, user, available_balance, in_escrow_balance, pending_balance]); // Include Redux balances in dependencies

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
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent mb-4"></div>
        <p className="text-neutral-600 text-lg">جاري تحميل لوحة التحكم...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50" dir="rtl">
      <Card className="max-w-md border-danger">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="h-16 w-16 text-danger mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
              <span className="text-2xl">⚠</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">خطأ في التحميل</h3>
            <p className="text-danger">{error}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 p-6" dir="rtl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-primary rounded-xl">
            <LayoutDashboard className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-primary">نظرة عامة على لوحة التحكم</h1>
            <p className="text-neutral-600 text-lg mt-1">مرحبًا بعودتك! إليك ما يحدث مع طلباتك</p>
          </div>
        </div>
        <div className="h-1 w-32 bg-gradient-to-r from-accent to-accent/30 rounded-full"></div>
      </div>

      {/* Balances and Stats */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label}
            className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
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
              <p className="text-neutral-600 font-medium text-sm">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Balance Transfer Component */}
      <div className="flex justify-center mb-8">
        <div className="w-full lg:w-2/3">
          <BalanceDisplayAndTransfer />
        </div>
      </div>

      {/* Recent Requests */}
      <Card className="mb-8 border-0 shadow-lg">
        {/* Card Header with Accent */}
        <div className="bg-gradient-to-r from-primary to-primary-600 p-6 rounded-t-xl">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl font-bold">طلبات الخدمة الأخيرة</CardTitle>
                  <CardDescription className="text-white/80 mt-1">
                    متابعة آخر طلباتك وحالتها
                  </CardDescription>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                asChild 
                className="bg-white hover:bg-neutral-100 text-primary font-semibold shadow-md"
              >
                <Link to="/dashboard/requests" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>عرض الكل</span>
                </Link>
              </Button>
            </div>
          </CardHeader>
        </div>
        
        <CardContent className="p-6 bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-neutral-200">
                  <TableHead className="text-neutral-700 font-bold">الخدمة</TableHead>
                  <TableHead className="text-neutral-700 font-bold">العامل</TableHead>
                  <TableHead className="text-neutral-700 font-bold">التاريخ</TableHead>
                  <TableHead className="text-neutral-700 font-bold">الحالة</TableHead>
                  <TableHead className="text-neutral-700 font-bold">المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.length > 0 ? (
                  recentRequests.map((request) => (
                    <TableRow 
                      key={request.id}
                      className="hover:bg-neutral-50 transition-colors border-b border-neutral-100"
                    >
                      <TableCell className="font-medium text-neutral-800">{request.service}</TableCell>
                      <TableCell className="text-neutral-600">{request.worker || "غير متاح"}</TableCell>
                      <TableCell className="text-neutral-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-neutral-400" />
                          {request.date}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="font-semibold text-primary">{request.amount}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-neutral-100 rounded-full">
                          <FileText className="h-8 w-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-500 font-medium">لا توجد طلبات حديثة</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-neutral-100 border-b border-neutral-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Zap className="h-5 w-5 text-accent-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-neutral-800">إجراءات سريعة</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              className="bg-primary hover:bg-primary-600 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              asChild
            >
              <Link to="/order/create" className="flex items-center justify-center gap-3">
                <PlusCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>طلب خدمة جديدة</span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              asChild 
              className="border-2 border-primary/30 hover:bg-primary/5 hover:border-primary font-semibold py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <Link to="/dashboard/messages" className="flex items-center justify-center gap-3">
                <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>عرض الرسائل</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
