import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Users, UserPlus, Edit } from "lucide-react";

export function AdminUsers() {
  const recentUsers = [
    { id: 1, name: "جون سميث", email: "john@example.com", type: "عامل", status: "نشط", joinDate: "5 نوفمبر 2025" },
    { id: 2, name: "سارة ويلسون", email: "sarah@example.com", type: "عميل", status: "نشط", joinDate: "5 نوفمبر 2025" },
    { id: 3, name: "مايك جونسون", email: "mike@example.com", type: "عامل", status: "معلق", joinDate: "4 نوفمبر 2025" },
    { id: 4, name: "إيما ديفيس", email: "emma@example.com", type: "عميل", status: "نشط", joinDate: "4 نوفمبر 2025" },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      "نشط": { variant: "default", className: "bg-green-100 text-green-800" },
      "معلق": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "غير نشط": { variant: "default", className: "bg-gray-100 text-gray-800" },
    };
    const config = variants[status] || variants["معلق"];
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    return (
      <Badge variant="outline" className={type === "عامل" ? "border-primary text-primary" : "border-secondary text-secondary"}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center space-x-2">
            <Users className="h-7 w-7" />
            <span>إدارة المستخدمين</span>
          </h1>
          <p className="text-muted-foreground">إدارة جميع مستخدمي المنصة</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>إضافة مستخدم جديد</span>
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الانضمام</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getTypeBadge(user.type)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Edit className="h-4 w-4" />
                      <span>تعديل</span>
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
