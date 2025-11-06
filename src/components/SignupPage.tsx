import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface SignupPageProps {
  onNavigate: (page: string) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const [userType, setUserType] = useState<"client" | "worker">("client");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Mock signup
    alert(`Account created successfully as ${userType}! (Demo)`);
    onNavigate(userType === "client" ? "client-dashboard" : "worker-dashboard");
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary rounded-lg px-4 py-2 inline-block mb-4">
            <span className="text-primary-foreground">Srvana</span>
          </div>
          <h1 className="mb-2">Create an Account</h1>
          <p className="text-muted-foreground">Join our community today</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Choose your account type and fill in your details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Type */}
              <div>
                <Label className="mb-3 block">I am a:</Label>
                <RadioGroup
                  value={userType}
                  onValueChange={(value) => setUserType(value as "client" | "worker")}
                  className="flex gap-4"
                >
                  <div className="flex-1">
                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      userType === "client" 
                        ? "border-primary bg-accent" 
                        : "border-border hover:border-primary/50"
                    }`}>
                      <RadioGroupItem value="client" id="client" className="sr-only" />
                      <Label htmlFor="client" className="cursor-pointer block">
                        <div className="text-center">
                          <div className="mb-2">👤</div>
                          <div>Client</div>
                          <p className="text-muted-foreground mt-1">
                            I need services
                          </p>
                        </div>
                      </Label>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      userType === "worker" 
                        ? "border-primary bg-accent" 
                        : "border-border hover:border-primary/50"
                    }`}>
                      <RadioGroupItem value="worker" id="worker" className="sr-only" />
                      <Label htmlFor="worker" className="cursor-pointer block">
                        <div className="text-center">
                          <div className="mb-2">🔧</div>
                          <div>Worker</div>
                          <p className="text-muted-foreground mt-1">
                            I offer services
                          </p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Form Fields */}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                  className="bg-input-background"
                />
              </div>
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1 (555) 000-0000"
                  required
                  className="bg-input-background"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
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
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
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
                Create Account
              </Button>
            </form>

            <div className="mt-6">
              <Separator />
              <div className="text-center mt-6">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => onNavigate("login")}
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
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
