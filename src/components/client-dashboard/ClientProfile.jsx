import { Card, CardContent } from "../ui/card";

export function ClientProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">إعدادات الملف الشخصي</h1>
        <p className="text-muted-foreground">تحديث معلوماتك الشخصية</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            إعدادات الملف الشخصي قادمة قريبًا
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
