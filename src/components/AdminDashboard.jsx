import { LayoutDashboard, Users, Briefcase, FileText, Settings, Shield } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Routes, Route } from "react-router-dom";
import { AdminOverview } from "./admin-dashboard/AdminOverview";
import { AdminUsers } from "./admin-dashboard/AdminUsers";
import { AdminServices } from "./admin-dashboard/AdminServices";
import { AdminVerifications } from "./admin-dashboard/AdminVerifications";
import { AdminReports } from "./admin-dashboard/AdminReports";
import { AdminSettings } from "./admin-dashboard/AdminSettings";

export function AdminDashboard() {
  const sidebarItems = [
    { icon: LayoutDashboard, label: "نظرة عامة", path: "/admin-dashboard" },
    { icon: Users, label: "المستخدمون", path: "/admin-dashboard/users" },
    { icon: Shield, label: "طلبات التحقق", path: "/admin-dashboard/verifications" },
    { icon: Briefcase, label: "الخدمات", path: "/admin-dashboard/services" },
    { icon: FileText, label: "التقارير", path: "/admin-dashboard/reports" },
    { icon: Settings, label: "الإعدادات", path: "/admin-dashboard/settings" },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userName="المستخدم المسؤول"
      userRole="مسؤول"
    >
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="verifications" element={<AdminVerifications />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </DashboardLayout>
  );
}
