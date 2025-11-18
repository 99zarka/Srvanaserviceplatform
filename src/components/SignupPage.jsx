import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import BASE_URL from "../config/api";

const signupSchema = z
  .object({
    first_name: z.string().min(1, "الاسم الأول مطلوب"),
    last_name: z.string().min(1, "اسم العائلة مطلوب"),
    email: z.string().email("صيغة البريد الإلكتروني غير صحيحة").min(1, "البريد الإلكتروني مطلوب"),
    phone_number: z
      .string()
      .min(1, "رقم الهاتف مطلوب")
      .regex(/^\+?[0-9()\s-]+$/, "صيغة رقم الهاتف غير صحيحة"), // Basic phone number regex
    password: z
      .string()
      .min(8, "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل")
      //.regex(/[a-z]/, "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل")
      //.regex(/[A-Z]/, "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل")
      //.regex(/[0-9]/, "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل")
      //.regex(/[^a-zA-Z0-9]/, "يجب أن تحتوي كلمة المرور على حرف خاص واحد على الأقل")
      ,
    password2: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.password === data.password2, {
    message: "كلمات المرور غير متطابقة",
    path: ["password2"],
  });

export function SignupPage() {
  const [userType, setUserType] = useState("client");
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { // Add default values to ensure fields are initialized
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        password2: "",
    },
  });

  const onSubmit = async (data) => {
    console.log("Signup Payload:", JSON.stringify(data)); // Log payload for debugging
    try {
      const { password2, ...formDataToSend } = data; // Exclude confirmPassword
      const payload = {
        ...formDataToSend,
        password2: password2, // Add password2 back with the correct name for the API
        // Potentially add user_type or other fields if the API expects it for registration
      };

      const response = await fetch(`${BASE_URL}/users/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle specific API errors
        if (responseData.email) {
          setError("email", { type: "manual", message: responseData.email[0] });
        }
        if (responseData.password) {
          setError("password", { type: "manual", message: responseData.password[0] });
        }
        if (responseData.password2) {
            setError("password2", { type: "manual", message: responseData.password2[0] });
        }
        if (responseData.non_field_errors) {
            setError("root.serverError", { type: "manual", message: responseData.non_field_errors[0] });
        }
        // General error handling for other API errors
        setError("root.serverError", {
          type: "manual",
          message: responseData.detail || "حدث خطأ غير متوقع أثناء التسجيل.",
        });
        return;
      }

      alert("تم التسجيل بنجاح! يرجى تسجيل الدخول."); // Consider a more user-friendly notification
      navigate("/login"); // Redirect to login page after successful registration
    } catch (error) {
      console.error("Registration error:", error);
      setError("root.serverError", {
        type: "manual",
        message: "خطأ في الشبكة أو تعذر الوصول إلى الخادم.",
      });
    }
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="first_name">الاسم الأول</Label>
                    <Controller
                        name="first_name"
                        control={control}
                        render={({ field }) => (
                            <Input
                                id="first_name"
                                placeholder="جون"
                                className="bg-input-background"
                                {...field}
                            />
                        )}
                    />
                    {errors.first_name && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.first_name.message}
                        </p>
                    )}
                </div>
                <div>
                    <Label htmlFor="last_name">اسم العائلة</Label>
                    <Controller
                        name="last_name"
                        control={control}
                        render={({ field }) => (
                            <Input
                                id="last_name"
                                placeholder="دو"
                                className="bg-input-background"
                                {...field}
                            />
                        )}
                    />
                    {errors.last_name && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.last_name.message}
                        </p>
                    )}
                </div>
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            className="bg-input-background"
                            dir="ltr"
                            {...field}
                        />
                    )}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone_number">رقم الهاتف</Label>
                <Controller
                    name="phone_number"
                    control={control}
                    render={({ field }) => (
                        <Input
                            id="phone_number"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            className="bg-input-background"
                            {...field}
                        />
                    )}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone_number.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password">كلمة المرور</Label>
                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="bg-input-background"
                            {...field}
                        />
                    )}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password2">تأكيد كلمة المرور</Label>
                <Controller
                    name="password2"
                    control={control}
                    render={({ field }) => (
                        <Input
                            id="password2"
                            type="password"
                            placeholder="••••••••"
                            className="bg-input-background"
                            {...field}
                        />
                    )}
                />
                {errors.password2 && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password2.message}
                  </p>
                )}
              </div>
              {errors.root?.serverError && (
                <p className="text-red-500 text-sm mt-1 text-center">
                  {errors.root.serverError.message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
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
