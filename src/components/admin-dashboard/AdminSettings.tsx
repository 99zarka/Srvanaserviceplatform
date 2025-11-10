import { Card, CardContent } from "./ui/card";

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Platform Settings</h1>
        <p className="text-muted-foreground">Configure platform settings and preferences</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            Settings panel coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
