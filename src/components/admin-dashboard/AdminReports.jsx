import { Card, CardContent } from "../ui/card";
import { BarChart } from "lucide-react";

export function AdminReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <BarChart className="h-7 w-7" />
          <span>التقارير والتحليلات</span>
        </h1>
        <p className="text-muted-foreground">عرض أداء المنصة والتحليلات</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            لوحة تحكم التحليلات قريباً
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
