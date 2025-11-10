import { DollarSign } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function WorkerEarnings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Earnings</h1>
        <p className="text-muted-foreground">Track your income and payment history</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-2">Total Earnings</p>
            <div className="text-green-600">$12,450</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-2">This Month</p>
            <div className="text-green-600">$3,420</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-2">Pending</p>
            <div className="text-yellow-600">$890</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
