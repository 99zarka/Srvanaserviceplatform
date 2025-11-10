import { Card, CardContent } from "../ui/card";

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">إعدادات المنصة</h1>
        <p className="text-muted-foreground">تكوين إعدادات وتفضيلات المنصة</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            لوحة الإعدادات قريباً
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
