import { Card, CardContent } from "../ui/card";

export function AdminServices() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Service Management</h1>
        <p className="text-muted-foreground">Manage service categories and listings</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            Service management interface coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
