import { Card, CardContent } from "../ui/card";

export function ClientPayments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">سجل الدفعات</h1>
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
