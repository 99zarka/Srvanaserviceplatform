import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Briefcase, Eye } from "lucide-react";

export function WorkerTasks() {
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
          <Briefcase className="h-7 w-7" />
          <span>مهامي</span>
        </h1>
        <p className="text-muted-foreground">إدارة مهامك المجدولة والنشطة</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العميل</TableHead>
                <TableHead>الخدمة</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الإجراءات</TableHead>
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
                  <TableCell>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>عرض التفاصيل</span>
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
