import { Card, CardContent } from "../ui/card";
import { Star } from "lucide-react";

export function WorkerReviews() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <Star className="h-7 w-7 text-yellow-600" />
          <span>التقييمات والمراجعات</span>
        </h1>
        <p className="text-muted-foreground">شاهد ما يقوله العملاء عن عملك</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="flex justify-center mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <div className="mb-2">4.9 / 5.0</div>
            <p className="text-muted-foreground">بناءً على 87 مراجعة</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
