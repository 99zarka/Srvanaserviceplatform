import {
  Home,
  FileText,
  MessageSquare,
  User,
  Flag,
  DollarSign,
  ShoppingCart,
  Briefcase,
  Star,
  Mail,
  LayoutDashboard,
  Users,
  Settings,
  Shield,
} from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { ClientOverview } from "./client-dashboard/ClientOverview";
import { ClientRequests } from "./client-dashboard/ClientRequests";
import { ClientMessages } from "./client-dashboard/ClientMessages";
import { ClientDisputes } from "./client-dashboard/ClientDisputes";
import { ClientFinancials } from "./client-dashboard/ClientFinancials";
import ClientOrdersAndOffers from "./client-dashboard/ClientOrdersAndOffers";
import EditOrderPage from "./client-dashboard/EditOrderPage";
import ViewOrderPage from "./client-dashboard/ViewOrderPage";
import { WorkerOverview } from "./worker-dashboard/WorkerOverview";
import { WorkerTasks } from "./worker-dashboard/WorkerTasks";
import { WorkerEarnings } from "./worker-dashboard/WorkerEarnings";
import { WorkerReviews } from "./worker-dashboard/WorkerReviews";
import { WorkerClientOffers } from "./worker-dashboard/WorkerClientOffers";
import { WorkerTaskDetails } from "./worker-dashboard/WorkerTaskDetails";
import { WorkerDisputes } from "./worker-dashboard/WorkerDisputes";
import { WorkerTransactions } from "./worker-dashboard/WorkerTransactions";
import { AdminOverview } from "./admin-dashboard/AdminOverview";
import { AdminUsers } from "./admin-dashboard/AdminUsers";
import { AdminServices } from "./admin-dashboard/AdminServices";
import { AdminVerifications } from "./admin-dashboard/AdminVerifications";
import { AdminReports } from "./admin-dashboard/AdminReports";
import { AdminSettings } from "./admin-dashboard/AdminSettings";

export function UnifiedDashboard() {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.user_id;
  const userName = user ? `${user.first_name} ${user.last_name}` : "اسم المستخدم";
  const userRole = user ? user.user_type?.user_type_name : "عميل";
  const userProfileImage = user?.profile_photo || null;

  const mainTools = [
    { icon: Home, label: "نظرة عامة", path: "/dashboard" },
    { icon: FileText, label: "طلباتي", path: "requests" },
    { icon: DollarSign, label: "الماليات والمعاملات", path: "financials" },
    { icon: ShoppingCart, label: "الطلبات والعروض", path: "orders-offers" },
    { icon: MessageSquare, label: "الرسائل", path: "messages" },
    { icon: Flag, label: "النزاعات", path: "disputes" },
    { icon: User, label: "الملف الشخصي", path: `/profile/${userId}` },
  ];

  const technicianTools = [
    { icon: Briefcase, label: "مهامي", path: "tasks" },
    { icon: Mail, label: "عروض العملاء", path: "client-offers" },
    { icon: DollarSign, label: "الأرباح", path: "earnings" },
    { icon: Star, label: "التقييمات", path: "reviews" },
    { icon: Flag, label: "النزاعات", path: "disputes" },
    { icon: DollarSign, label: "المعاملات", path: "transactions" },
  ];

  const adminTools = [
    { icon: LayoutDashboard, label: "نظرة عامة", path: "/dashboard" },
    { icon: Users, label: "المستخدمون", path: "users" },
    { icon: Shield, label: "طلبات التحقق", path: "verifications" },
    { icon: Briefcase, label: "الخدمات", path: "services" },
    { icon: FileText, label: "التقارير", path: "reports" },
    { icon: Settings, label: "الإعدادات", path: "settings" },
  ];

  let sidebarItems = [];

  if (userRole === "client") {
    sidebarItems = [
      { isTitle: true, label: "Main Tools" },
      ...mainTools,
    ];
  } else if (userRole === "technician") {
    sidebarItems = [
      { isTitle: true, label: "Main Tools" },
      ...mainTools,
      { isSeparator: true },
      { isTitle: true, label: "Technician Tools" },
      ...technicianTools,
    ];
  } else if (userRole === "admin") {
    sidebarItems = [
      { isTitle: true, label: "Main Tools" },
      ...mainTools,
      { isSeparator: true },
      { isTitle: true, label: "Technician Tools" },
      ...technicianTools,
      { isSeparator: true },
      { isTitle: true, label: "Admin Tools" },
      ...adminTools,
    ];
  }

  const routes = (
    <Routes>
      {/* Client Routes */}
      <Route index element={<ClientOverview />} />
      <Route path="requests" element={<ClientRequests />} />
      <Route path="financials" element={<ClientFinancials />} />
      <Route path="orders-offers" element={<ClientOrdersAndOffers />} />
      <Route path="orders-offers/edit/:orderId" element={<EditOrderPage />} />
      <Route path="orders-offers/view/:orderId" element={<ViewOrderPage />} />
      <Route path="messages" element={<ClientMessages />} />
      <Route path="disputes" element={<ClientDisputes />} />

      {/* Worker Routes */}
      <Route path="tasks" element={<WorkerTasks />} />
      <Route path="tasks/:taskId" element={<WorkerTaskDetails />} />
      <Route path="earnings" element={<WorkerEarnings />} />
      <Route path="reviews" element={<WorkerReviews />} />
      <Route path="client-offers" element={<WorkerClientOffers />} />
      <Route path="transactions" element={<WorkerTransactions />} />
      
      {/* Admin Routes */}
      <Route path="users" element={<AdminUsers />} />
      <Route path="verifications" element={<AdminVerifications />} />
      <Route path="services" element={<AdminServices />} />
      <Route path="reports" element={<AdminReports />} />
      <Route path="settings" element={<AdminSettings />} />
    </Routes>
  );

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userName={userName}
      userRole={userRole}
      userProfileImage={userProfileImage}
      userId={userId}
    >
      {routes}
    </DashboardLayout>
  );
}
