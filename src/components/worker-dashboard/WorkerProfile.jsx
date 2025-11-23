import { Card, CardContent } from "../ui/card";
import { User } from "lucide-react";

export function WorkerProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <User className="h-7 w-7" />
          <span>إعدادات الملف الشخصي</span>
        </h1>
        <p className="text-muted-foreground">تحديث معلوماتك المهنية</p>
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
