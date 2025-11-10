import { Card, CardContent } from "../ui/card";

export function ClientPayments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Payment History</h1>
        <p className="text-muted-foreground">View your payment transactions</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            Payment history and invoices will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
