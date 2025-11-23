import { Card, CardContent } from "../ui/card";
import { Briefcase } from "lucide-react";

export function AdminServices() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <Briefcase className="h-7 w-7" />
          <span>إدارة الخدمات</span>
        </h1>
        <p className="text-muted-foreground">إدارة فئات الخدمات والقوائم</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            واجهة إدارة الخدمات قريباً
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
