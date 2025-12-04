import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DollarSign, Eye } from "lucide-react";
import { getUserTransactions } from "../../redux/transactionSlice";

export function WorkerTransactions() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { transactions, loading, error } = useSelector((state) => state.transactions);

  useEffect(() => {
    if (token) {
      dispatch(getUserTransactions());
    }
  }, [token, dispatch]);

  const getTransactionTypeBadge = (type) => {
    let translatedType = type;
    let className = "bg-gray-100 text-gray-800"; // Default

    switch (type) {
      case "DEPOSIT":
        translatedType = "إيداع";
        className = "bg-green-100 text-green-800";
        break;
      case "WITHDRAWAL":
        translatedType = "سحب";
        className = "bg-red-100 text-red-800";
        break;
      case "ESCROW_FUNDING":
        translatedType = "تمويل الضمان";
        className = "bg-blue-100 text-blue-800";
        break;
      case "ESCROW_RELEASE":
        translatedType = "إفراج الضمان";
        className = "bg-purple-100 text-purple-800";
        break;
      case "DISPUTE_SETTLEMENT":
        translatedType = "تسوية نزاع";
        className = "bg-orange-100 text-orange-800";
        break;
      case "SERVICE_PAYMENT":
        translatedType = "دفعة خدمة";
        className = "bg-indigo-100 text-indigo-800";
        break;
      case "SERVICE_REFUND":
        translatedType = "استرداد خدمة";
        className = "bg-pink-100 text-pink-800";
        break;
      default:
        translatedType = type;
        break;
    }
    return <Badge className={className}>{translatedType}</Badge>;
  };

  if (loading) return <div className="text-center p-8" dir="rtl">جاري تحميل المعاملات...</div>;
  if (error) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error}</div>;

  if (transactions.length === 0) {
    return <div className="text-center p-8" dir="rtl">لا توجد معاملات حاليًا.</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <DollarSign className="h-7 w-7" />
          <span>سجل المعاملات</span>
        </h1>
        <p className="text-muted-foreground">عرض وتتبع جميع معاملاتك المالية</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>معرف المعاملة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{getTransactionTypeBadge(transaction.transaction_type)}</TableCell>
                  <TableCell>${transaction.amount}</TableCell>
                  <TableCell>{transaction.status}</TableCell> {/* Assuming status is already translated or simple */}
                  <TableCell>{new Date(transaction.timestamp).toLocaleString("ar-EG")}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild className="flex items-center space-x-2">
                      <Link to={`/transactions/${transaction.id}`}> {/* Assuming a transaction detail page */}
                        <Eye className="h-4 w-4" />
                        <span>عرض التفاصيل</span>
                      </Link>
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
