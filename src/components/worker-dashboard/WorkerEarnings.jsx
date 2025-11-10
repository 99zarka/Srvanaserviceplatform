import { DollarSign } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export function WorkerEarnings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">الأرباح</h1>
        <p className="text-muted-foreground">تتبع دخلك وسجل الدفعات</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-2">إجمالي الأرباح</p>
            <div className="text-green-600">$12,450</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-2">هذا الشهر</p>
            <div className="text-green-600">$3,420</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-2">معلقة</p>
            <div className="text-yellow-600">$890</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
