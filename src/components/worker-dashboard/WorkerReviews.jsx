import { Card, CardContent } from "../ui/card";

export function WorkerReviews() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">التقييمات والمراجعات</h1>
        <p className="text-muted-foreground">شاهد ما يقوله العملاء عن عملك</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-yellow-600 mb-2">⭐⭐⭐⭐⭐</div>
            <div className="mb-2">4.9 / 5.0</div>
            <p className="text-muted-foreground">بناءً على 87 مراجعة</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
