import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Link, useNavigate } from "react-router-dom";

export function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login - in real app would authenticate
    alert("تم تسجيل الدخول بنجاح! (تجريبي)");
    navigate("/client-dashboard");
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary rounded-lg px-4 py-2 inline-block mb-4">
            <span className="text-primary-foreground">Srvana</span>
          </div>
          <h1 className="mb-2">مرحبًا بعودتك</h1>
          <p className="text-muted-foreground">سجل الدخول إلى حسابك للمتابعة</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تسجيل الدخول</CardTitle>
            <CardDescription>
              أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
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
                  dir="ltr"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Link
                    to="/forgot-password" // Assuming a forgot password route
                    className="text-primary hover:underline"
                  >
                    نسيت؟
                  </Link>
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
                تسجيل الدخول
              </Button>
            </form>

            <div className="mt-6">
              <Separator />
              <div className="text-center mt-6">
                <p className="text-muted-foreground">
                  ليس لديك حساب؟{" "}
                  <Link
                    to="/signup"
                    className="text-primary hover:underline"
                  >
                    إنشاء حساب
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link to="/client-dashboard">تجريبي: لوحة تحكم العميل</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link to="/worker-dashboard">تجريبي: لوحة تحكم العامل</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link to="/admin-dashboard">تجريبي: لوحة تحكم المسؤول</Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-muted-foreground hover:text-primary"
          >
            ← العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
