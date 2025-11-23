import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { FileText, Eye } from "lucide-react";

export function ClientRequests() {
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
        <h1 className="mb-2 flex items-center space-x-2">
          <FileText className="h-7 w-7" />
          <span>طلبات خدمتي</span>
        </h1>
        <p className="text-muted-foreground">تتبع وإدارة جميع طلبات خدمتك</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الخدمة</TableHead>
                <TableHead>العامل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الإجراءات</TableHead>
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
