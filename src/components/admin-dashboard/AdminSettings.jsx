import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Settings, Save, Loader2 } from "lucide-react";
import api from "../../utils/api";
import { toast } from "sonner";

export function AdminSettings() {
  const { token } = useSelector((state) => state.auth);
  const [settings, setSettings] = useState({
    site_name: "",
    contact_email: "",
    support_phone: "",
    allow_registrations: true,
    maintenance_mode: false,
    welcome_message: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  // const { toast } = useToast(); // No longer needed

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.get("/api/settings/", { headers }); // Assuming a /api/settings/ endpoint
        if (response && response.results && response.results.length > 0) {
          // Assuming settings are returned as an array, take the first one
          setSettings(response.results[0]);
        } else {
          // If no settings found, initialize with default values
          setSettings({
            site_name: "Srvana Platform",
            contact_email: "support@srvana.com",
            support_phone: "+966 50 123 4567",
            allow_registrations: true,
            maintenance_mode: false,
            welcome_message: "مرحبًا بكم في منصة سرفانا! اكتشف خدمات احترافية.",
          });
        }
      } catch (err) {
        setError("فشل في جلب الإعدادات. الرجاء المحاولة لاحقًا.");
        console.error("Failed to fetch settings:", err);
        toast.error("خطأ", {
          description: "فشل في جلب الإعدادات.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [token, toast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // This assumes a single settings object on the backend, and we are updating it.
      // A POST/PUT to /api/settings/ or PATCH to /api/settings/{id}/
      // For simplicity, we'll use POST for now to create/update
      const method = settings.id ? 'PATCH' : 'POST';
      const url = settings.id ? `/api/settings/${settings.id}/` : "/api/settings/";

      const response = await api[method.toLowerCase()](url, settings, { headers });

      setSettings(response); // Update local state with response from backend
      toast.success("نجاح", {
        description: "تم حفظ الإعدادات بنجاح.",
      });
    } catch (err) {
      setError("فشل في حفظ الإعدادات. الرجاء المحاولة لاحقًا.");
      console.error("Failed to save settings:", err);
      toast.error("خطأ", {
        description: "فشل في حفظ الإعدادات.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <Settings className="h-7 w-7" />
          <span>إعدادات المنصة</span>
        </h1>
        <p className="text-muted-foreground">تكوين إعدادات وتفضيلات المنصة</p>
      </div>

      {isLoading ? (
        <div className="text-center p-4">جاري تحميل الإعدادات...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>الإعدادات العامة</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="site_name">اسم الموقع</Label>
                <Input
                  type="text"
                  id="site_name"
                  name="site_name"
                  value={settings.site_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="contact_email">بريد التواصل</Label>
                <Input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={settings.contact_email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="support_phone">رقم دعم العملاء</Label>
                <Input
                  type="text"
                  id="support_phone"
                  name="support_phone"
                  value={settings.support_phone}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow_registrations"
                  name="allow_registrations"
                  checked={settings.allow_registrations}
                  onCheckedChange={(checked) => handleSwitchChange("allow_registrations", checked)}
                />
                <Label htmlFor="allow_registrations">السماح بالتسجيلات الجديدة</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenance_mode"
                  name="maintenance_mode"
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => handleSwitchChange("maintenance_mode", checked)}
                />
                <Label htmlFor="maintenance_mode">وضع الصيانة</Label>
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="welcome_message">رسالة الترحيب</Label>
                <Textarea
                  id="welcome_message"
                  name="welcome_message"
                  value={settings.welcome_message}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                حفظ الإعدادات
              </Button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
