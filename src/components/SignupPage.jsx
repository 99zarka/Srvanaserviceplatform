import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { UserPlus, User, Wrench, LogIn, Home } from "lucide-react";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import BASE_URL from "../config/api";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError, setSocialLoginData } from "../redux/authSlice";

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
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth); // Get isLoading and error from Redux state

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
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

  useEffect(() => {
    // Clear any previous Redux errors when component mounts
    dispatch(clearError());

    // Wait for Google Identity Services to load
    window.google?.accounts?.id?.initialize({
      client_id: '268062404120-nfkt7hf22qe38i8kerp11ju3s22ut4j1.apps.googleusercontent.com',
      callback: handleGoogleSignIn
    });

    // Render the Google sign-in button
    window.google?.accounts?.id?.renderButton(
      document.getElementById('google-signup-button'),
      { theme: 'outline', size: 'large' }
    );
  }, [dispatch]);

  const handleGoogleSignIn = async (response) => {
    try {
      const backendResponse = await fetch(`${BASE_URL}/users/google-login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token: response.credential }),
      });

      const data = await backendResponse.json();

      if (backendResponse.ok) {
        // Dispatch the new social login action to handle storing tokens and user data
        dispatch(setSocialLoginData({ 
          access: data.access, 
          refresh: data.refresh, 
          user: data.user 
        }));

        alert("تم التسجيل بنجاح باستخدام Google!");
        // The Google login flow should ideally redirect to the dashboard after successful login/signup
        navigate("/client-dashboard");
      } else {
        setError("root.serverError", {
          type: "manual",
          message: data.detail || "خطأ في التسجيل باستخدام Google.",
        });
      }
    } catch (error) {
      console.error("Google signup error:", error);
      setError("root.serverError", {
        type: "manual",
        message: "خطأ في الشبكة أثناء التسجيل باستخدام Google.",
      });
    }
  };

  const onSubmit = async (data) => {
    console.log("Signup Payload:", JSON.stringify(data)); // Log payload for debugging
    // Dispatch the register thunk
    const resultAction = await dispatch(register({ ...data, user_type: userType }));

    if (register.fulfilled.match(resultAction)) {
      alert("تم التسجيل بنجاح! تم تسجيل الدخول تلقائيًا.");
      navigate("/client-dashboard");
    } else if (register.rejected.match(resultAction)) {
      const payloadError = resultAction.payload;
      if (payloadError) {
        // Assuming the backend returns specific field errors
        if (payloadError.email) {
          setError("email", { type: "manual", message: payloadError.email[0] });
        }
        if (payloadError.password) {
          setError("password", { type: "manual", message: payloadError.password[0] });
        }
        if (payloadError.password2) {
          setError("password2", { type: "manual", message: payloadError.password2[0] });
        }
        if (payloadError.non_field_errors) {
          setError("root.serverError", { type: "manual", message: payloadError.non_field_errors[0] });
        } else if (typeof payloadError === 'string') {
          // Generic error message if payload is a string
          setError("root.serverError", { type: "manual", message: payloadError });
        }
      } else {
        setError("root.serverError", { type: "manual", message: "حدث خطأ غير متوقع أثناء التسجيل." });
      }
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary rounded-lg px-4 py-2 inline-block mb-4">
            <span className="text-primary-foreground">Srvana</span>
          </div>
          <h1 className="mb-2 flex items-center justify-center space-x-2">
            <UserPlus className="h-7 w-7" />
            <span>إنشاء حساب</span>
          </h1>
          <p className="text-muted-foreground">انضم إلى مجتمعنا اليوم</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-6 w-6" />
              <span>إنشاء حساب</span>
            </CardTitle>
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
                          <User className="h-7 w-7 mx-auto mb-2" />
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
                          <Wrench className="h-7 w-7 mx-auto mb-2" />
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
              {error && ( // Display Redux error if present
                <p className="text-red-500 text-sm mt-1 text-center">
                  {error.detail || error.non_field_errors?.[0] || error.message || "حدث خطأ غير متوقع."}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center space-x-2"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <UserPlus className="h-5 w-5 animate-pulse" />
                    <span>جاري إنشاء الحساب...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>إنشاء حساب</span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Separator />
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">أو</p>
                <div
                  id="google-signup-button"
                  className="flex justify-center"
                ></div>
                <div className="mt-6">
                  <p className="text-muted-foreground">
                    هل لديك حساب بالفعل؟{" "}
                    <Link
                      to="/login"
                      className="text-primary hover:underline flex items-center space-x-1"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>تسجيل الدخول</span>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-muted-foreground hover:text-primary flex items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>العودة إلى الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
