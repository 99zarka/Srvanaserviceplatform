import { DollarSign, PiggyBank, CalendarCheck, Clock } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export function WorkerEarnings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <DollarSign className="h-7 w-7" />
          <span>الأرباح</span>
        </h1>
        <p className="text-muted-foreground">تتبع دخلك وسجل الدفعات</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">إجمالي الأرباح</p>
              <div className="text-green-600 text-2xl font-bold">$12,450</div>
            </div>
            <PiggyBank className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">هذا الشهر</p>
              <div className="text-green-600 text-2xl font-bold">$3,420</div>
            </div>
            <CalendarCheck className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-2">معلقة</p>
              <div className="text-yellow-600 text-2xl font-bold">$890</div>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
