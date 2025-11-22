import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import BASE_URL from "../config/api";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../redux/authSlice";

const loginSchema = z.object({
  email: z.string().email("صيغة البريد الإلكتروني غير صحيحة").min(1, "البريد الإلكتروني مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
        email: "",
        password: "",
    },
  });

  useEffect(() => {
    // Wait for Google Identity Services to load
    window.google?.accounts?.id?.initialize({
      client_id: '268062404120-nfkt7hf22qe38i8kerp11ju3s22ut4j1.apps.googleusercontent.com',
      callback: handleGoogleSignIn
    });

    // Render the Google sign-in button
    window.google?.accounts?.id?.renderButton(
      document.getElementById('google-signin-button'),
      { theme: 'outline', size: 'large' }
    );
  }, []);

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
        // Store tokens
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);

        alert("تم تسجيل الدخول بنجاح باستخدام Google!");
        navigate("/client-dashboard");
      } else {
        setError("root.serverError", {
          type: "manual",
          message: data.detail || "خطأ في تسجيل الدخول باستخدام Google.",
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("root.serverError", {
        type: "manual",
        message: "خطأ في الشبكة أثناء تسجيل الدخول باستخدام Google.",
      });
    }
  };

  const onSubmit = async (data) => {
    console.log("Login Payload:", JSON.stringify(data)); // Log payload for debugging

    // Clear any previous errors
    dispatch(clearError());

    // Dispatch the Redux login thunk
    const resultAction = await dispatch(login(data));

    if (login.fulfilled.match(resultAction)) {
      console.log("Login successful!");
      // Redux will handle updating the state and localStorage
      // Navigate to dashboard
      navigate("/client-dashboard");
    } else if (login.rejected.match(resultAction)) {
      console.log("Login failed:", resultAction.payload);

      const payloadError = resultAction.payload;
      if (payloadError) {
        // Handle specific API errors
        if (typeof payloadError === 'string') {
          setError("root.serverError", {
            type: "manual",
            message: payloadError,
          });
        } else if (payloadError.detail && payloadError.detail.includes('credentials')) {
          setError("email", { type: "manual", message: "بيانات الاعتماد غير صحيحة" });
          setError("password", { type: "manual", message: "بيانات الاعتماد غير صحيحة" });
        } else {
          setError("root.serverError", {
            type: "manual",
            message: payloadError.detail || "حدث خطأ غير متوقع.",
          });
        }
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Link
                    to="/forgot-password" // Assuming a forgot password route
                    className="text-primary hover:underline"
                  >
                    نسيت؟
                  </Link>
                </div>
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
              {errors.root?.serverError && (
                <p className="text-red-500 text-sm mt-1 text-center">
                  {errors.root.serverError.message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            <div className="mt-6">
              <Separator />
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">أو</p>
                <div
                  id="google-signin-button"
                  className="flex justify-center"
                ></div>
                <div className="mt-6">
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
