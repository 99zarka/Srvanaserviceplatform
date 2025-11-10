import { Card, CardContent } from "../ui/card";

export function AdminReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">التقارير والتحليلات</h1>
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
