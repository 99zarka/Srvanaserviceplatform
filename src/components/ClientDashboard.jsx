import { Home, FileText, CreditCard, MessageSquare, User } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector
import { ClientOverview } from "./client-dashboard/ClientOverview";
import { ClientRequests } from "./client-dashboard/ClientRequests";
import { ClientPayments } from "./client-dashboard/ClientPayments";
import { ClientMessages } from "./client-dashboard/ClientMessages";

export function ClientDashboard() {
  const { user } = useSelector((state) => state.auth); // Get user from Redux state
  const userId = user?.user_id; // Get user ID

  const sidebarItems = [
    { icon: Home, label: "نظرة عامة", path: "/client-dashboard" },
    { icon: FileText, label: "طلباتي", path: "/client-dashboard/requests" },
    { icon: CreditCard, label: "المدفوعات", path: "/client-dashboard/payments" },
    { icon: MessageSquare, label: "الرسائل", path: "/client-dashboard/messages" },
    { icon: User, label: "الملف الشخصي", path: `/profile/${userId}` }, // Use dynamic user ID
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userName="جون دو"
      userRole="عميل"
    >
      <Routes>
        <Route index element={<ClientOverview />} />
        <Route path="requests" element={<ClientRequests />} />
        <Route path="payments" element={<ClientPayments />} />
        <Route path="messages" element={<ClientMessages />} />
      </Routes>
    </DashboardLayout>
  );
}
