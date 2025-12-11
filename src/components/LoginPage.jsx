import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LogIn, HelpCircle, UserPlus, LayoutDashboard, Users, Wrench, Shield, Home } from "lucide-react";
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
import { login, clearError, setSocialLoginData } from "../redux/authSlice";
import SrvanaLogo from "/assets/srvana-logo.svg";
import { BubbleBackground } from "./ui/bubble-background";

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
        // Dispatch the new social login action to handle storing tokens and user data
        dispatch(setSocialLoginData({ 
          access: data.access, 
          refresh: data.refresh, 
          user: data.user 
        }));

        alert("تم تسجيل الدخول بنجاح باستخدام Google!");
        navigate("/dashboard");
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
      navigate("/dashboard");
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
    <BubbleBackground
      interactive
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-md" dir="rtl">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Link to="/">
            <img 
              src={SrvanaLogo} 
              alt="Srvana Logo" 
              className="h-12 w-auto"
            />
          </Link>
          <Button
            size="lg"
            className="bg-[#1e3a5f] hover:bg-[#2c4a6f] text-white text-lg px-8 py-6"
          >
            <span>مرحبًا بعودتك</span>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
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
                    className="text-primary hover:underline flex items-center space-x-1"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>نسيت؟</span>
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
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center space-x-2"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LogIn className="h-5 w-5 animate-pulse" />
                    <span>جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>تسجيل الدخول</span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Separator />
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">أو</p>
                <div
                  id="google-signin-button"
                  className="flex justify-center w-full"
                ></div>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <span className="text-muted-foreground">ليس لديك حساب؟</span>
                  <Link
                    to="/signup"
                    className="text-primary hover:underline font-medium"
                  >
                    إنشاء حساب
                  </Link>
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
    </BubbleBackground>
  );
}
