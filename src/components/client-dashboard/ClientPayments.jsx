import { Card, CardContent } from "../ui/card";
import { CreditCard } from "lucide-react";

export function ClientPayments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <CreditCard className="h-7 w-7" />
          <span>سجل الدفعات</span>
        </h1>
        <p className="text-muted-foreground">عرض معاملات الدفع الخاصة بك</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            سيظهر سجل الدفعات والفواتير هنا
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
