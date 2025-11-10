import { Card, CardContent } from "./ui/card";

export function WorkerProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Update your professional information</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            Profile settings coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
