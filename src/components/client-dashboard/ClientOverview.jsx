import { Home, CreditCard, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Link } from "react-router-dom";

export function ClientOverview() {
  const stats = [
    { label: "الطلبات النشطة", value: "3", icon: Clock, color: "text-primary" },
    { label: "المكتملة", value: "12", icon: CheckCircle, color: "text-green-600" },
    { label: "إجمالي الإنفاق", value: "$2,450", icon: CreditCard, color: "text-blue-600" },
  ];

  const recentRequests = [
    { id: 1, service: "النجارة", worker: "جون سميث", status: "قيد التنفيذ", date: "4 نوفمبر 2025", amount: "$450" },
    { id: 2, service: "السباكة", worker: "سارة جونسون", status: "مكتملة", date: "1 نوفمبر 2025", amount: "$280" },
    { id: 3, service: "الكهرباء", worker: "مايك تشن", status: "قيد التنفيذ", date: "30 أكتوبر 2025", amount: "$520" },
    { id: 4, service: "الدهانات", worker: "إميلي ديفيس", status: "معلقة", date: "28 أكتوبر 2025", amount: "$380" },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      "قيد التنفيذ": { variant: "default", className: "bg-blue-100 text-blue-800" },
      "مكتملة": { variant: "default", className: "bg-green-100 text-green-800" },
      "معلقة": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "ملغاة": { variant: "default", className: "bg-red-100 text-red-800" },
    };
    const config = variants[status] || variants["معلقة"];
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">نظرة عامة على لوحة التحكم</h1>
        <p className="text-muted-foreground">مرحبًا بعودتك! إليك ما يحدث مع طلباتك.</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">{stat.label}</p>
                  <div className={stat.color}>{stat.value}</div>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>طلبات الخدمة الأخيرة</CardTitle>
            <Button variant="outline" asChild>
              <Link to="/client-dashboard/requests">عرض الكل</Link>
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
              {recentRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.service}</TableCell>
                  <TableCell>{request.worker}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{request.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              asChild
            >
              <Link to="/services">طلب خدمة جديدة</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/client-dashboard/messages">عرض الرسائل</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
