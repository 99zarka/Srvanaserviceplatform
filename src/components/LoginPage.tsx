import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in real app would authenticate
    alert("Login successful! (Demo)");
    onNavigate("client-dashboard");
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary rounded-lg px-4 py-2 inline-block mb-4">
            <span className="text-primary-foreground">Srvana</span>
          </div>
          <h1 className="mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your.email@example.com"
                  required
                  className="bg-input-background"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  className="bg-input-background"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6">
              <Separator />
              <div className="text-center mt-6">
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={() => onNavigate("signup")}
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onNavigate("client-dashboard")}
            >
              Demo: Client Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onNavigate("worker-dashboard")}
            >
              Demo: Worker Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onNavigate("admin-dashboard")}
            >
              Demo: Admin Dashboard
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate("home")}
            className="text-muted-foreground hover:text-primary"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
