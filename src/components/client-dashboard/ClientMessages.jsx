import { Card, CardContent } from "../ui/card";
import { MessageSquare } from "lucide-react";

export function ClientMessages() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <MessageSquare className="h-7 w-7" />
          <span>الرسائل</span>
        </h1>
        <p className="text-muted-foreground">تواصل مع العمال</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            لا توجد رسائل بعد
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
