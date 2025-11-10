import { Home, FileText, CreditCard, MessageSquare, User } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Routes, Route } from "react-router-dom";
import { ClientOverview } from "./client-dashboard/ClientOverview";
import { ClientRequests } from "./client-dashboard/ClientRequests";
import { ClientPayments } from "./client-dashboard/ClientPayments";
import { ClientMessages } from "./client-dashboard/ClientMessages";
import { ClientProfile } from "./client-dashboard/ClientProfile";

export function ClientDashboard() {
  const sidebarItems = [
    { icon: Home, label: "Overview", path: "/client-dashboard" },
    { icon: FileText, label: "My Requests", path: "/client-dashboard/requests" },
    { icon: CreditCard, label: "Payments", path: "/client-dashboard/payments" },
    { icon: MessageSquare, label: "Messages", path: "/client-dashboard/messages" },
    { icon: User, label: "Profile", path: "/client-dashboard/profile" },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userName="John Doe"
      userRole="Client"
    >
      <Routes>
        <Route index element={<ClientOverview />} />
        <Route path="requests" element={<ClientRequests />} />
        <Route path="payments" element={<ClientPayments />} />
        <Route path="messages" element={<ClientMessages />} />
        <Route path="profile" element={<ClientProfile />} />
      </Routes>
    </DashboardLayout>
  );
}
