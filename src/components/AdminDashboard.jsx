import { LayoutDashboard, Users, Briefcase, FileText, Settings } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Routes, Route } from "react-router-dom";
import { AdminOverview } from "./admin-dashboard/AdminOverview";
import { AdminUsers } from "./admin-dashboard/AdminUsers";
import { AdminServices } from "./admin-dashboard/AdminServices";
import { AdminReports } from "./admin-dashboard/AdminReports";
import { AdminSettings } from "./admin-dashboard/AdminSettings";

export function AdminDashboard() {
  const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin-dashboard" },
    { icon: Users, label: "Users", path: "/admin-dashboard/users" },
    { icon: Briefcase, label: "Services", path: "/admin-dashboard/services" },
    { icon: FileText, label: "Reports", path: "/admin-dashboard/reports" },
    { icon: Settings, label: "Settings", path: "/admin-dashboard/settings" },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userName="Admin User"
      userRole="Administrator"
    >
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </DashboardLayout>
  );
}
