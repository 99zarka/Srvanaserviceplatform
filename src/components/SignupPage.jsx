import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Link, useNavigate } from "react-router-dom";

export function SignupPage() {
  const [userType, setUserType] = useState("client");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
    alert("كلمات المرور غير متطابقة!");
      return;
    }
    // Mock signup
    alert(`تم إنشاء الحساب بنجاح كـ ${userType === "client" ? "عميل" : "عامل"}! (تجريبي)`);
    navigate(userType === "client" ? "/client-dashboard" : "/worker-dashboard");
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary rounded-lg px-4 py-2 inline-block mb-4">
            <span className="text-primary-foreground">Srvana</span>
          </div>
          <h1 className="mb-2">إنشاء حساب</h1>
          <p className="text-muted-foreground">انضم إلى مجتمعنا اليوم</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>إنشاء حساب</CardTitle>
            <CardDescription>
              اختر نوع حسابك واملأ التفاصيل الخاصة بك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Type */}
              <div>
                <Label className="mb-3 block">أنا:</Label>
                <RadioGroup
                  value={userType}
                  onValueChange={(value) => setUserType(value)}
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
                          <div>عميل</div>
                          <p className="text-muted-foreground mt-1">
                            أحتاج إلى خدمات
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
                          <div>عامل</div>
                          <p className="text-muted-foreground mt-1">
                            أقدم خدمات
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
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="جون دو"
                  required
                  className="bg-input-background"
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="بريدك.الإلكتروني@مثال.كوم"
                  required
                  className="bg-input-background"
                />
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
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
                <Label htmlFor="password">كلمة المرور</Label>
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
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
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
                إنشاء حساب
              </Button>
            </form>

            <div className="mt-6">
              <Separator />
              <div className="text-center mt-6">
                <p className="text-muted-foreground">
                  هل لديك حساب بالفعل؟{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline"
                  >
                    تسجيل الدخول
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
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
