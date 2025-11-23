import { Home, Briefcase, DollarSign, Star, Clock, CheckCircle, LayoutDashboard, Eye, CalendarCheck, Zap, CalendarPlus, CreditCard, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Link } from "react-router-dom";

export function WorkerOverview() {
  const stats = [
    { label: "المهام النشطة", value: "5", icon: Clock, color: "text-primary" },
    { label: "المهام المكتملة", value: "87", icon: CheckCircle, color: "text-green-600" },
    { label: "إجمالي الأرباح", value: "$12,450", icon: DollarSign, color: "text-blue-600" },
    { label: "التقييم", value: "4.9/5", icon: Star, color: "text-yellow-600" },
  ];

  const activeTasks = [
    { id: 1, client: "سارة ويليامز", service: "النجارة", location: "123 شارع البلوط", date: "6 نوفمبر 2025", amount: "$450", status: "مجدولة" },
    { id: 2, client: "مايكل براون", service: "النجارة", location: "456 شارع الصنوبر", date: "7 نوفمبر 2025", amount: "$320", status: "قيد التنفيذ" },
    { id: 3, client: "إيما ديفيس", service: "النجارة", location: "789 طريق القيقب", date: "8 نوفمبر 2025", amount: "$580", status: "مجدولة" },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      "مجدولة": { variant: "default", className: "bg-blue-100 text-blue-800" },
      "قيد التنفيذ": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "مكتملة": { variant: "default", className: "bg-green-100 text-green-800" },
    };
    const config = variants[status] || variants["مجدولة"];
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <LayoutDashboard className="h-7 w-7" />
          <span>لوحة تحكم العامل</span>
        </h1>
        <p className="text-muted-foreground">تتبع مهامك، أرباحك، وأدائك</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Active Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>المهام النشطة</span>
            </CardTitle>
            <Button variant="outline" asChild className="flex items-center space-x-2">
              <Link to="/worker-dashboard/tasks">
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
                <TableHead>العميل</TableHead>
                <TableHead>الخدمة</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المبلغ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.client}</TableCell>
                  <TableCell>{task.service}</TableCell>
                  <TableCell>{task.location}</TableCell>
                  <TableCell>{task.date}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{task.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarCheck className="h-5 w-5" />
              <span>هذا الشهر</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">المهام المكتملة</span>
                <span>14</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الأرباح</span>
                <span className="text-green-600">$3,420</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">متوسط التقييم</span>
                <span className="text-yellow-600">4.9 ⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>إجراءات سريعة</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center space-x-2">
                <CalendarPlus className="h-5 w-5" />
                <span>تحديث التوفر</span>
              </Button>
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>عرض سجل الدفعات</span>
              </Button>
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                <Edit className="h-5 w-5" />
                <span>تعديل الملف الشخصي</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
