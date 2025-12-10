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
  LogIn,
} from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Routes, Route, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
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
  const location = useLocation();
  const userId = user?.user_id;
  const userName = user ? `${user.first_name} ${user.last_name}` : "اسم المستخدم";
  
  // Handle different possible user type formats
  const userRole = user ? (
    user.user_type?.user_type_name || 
    user.user_type?.name || 
    user.user_type ||
    "client" // default fallback
  ) : "client";
  
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

  // Ensure user is authenticated before building sidebar items
  if (user) {
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
        { isTitle: true, label: "الادوات الرئيسية" },
        ...mainTools,
        { isSeparator: true },
        { isTitle: true, label: "ادوات الفني" },
        ...technicianTools,
        { isSeparator: true },
        { isTitle: true, label: "ادوات المدير" },
        ...adminTools,
      ];
    } else {
      // Fallback for unknown user types - default to client tools
      sidebarItems = [
        { isTitle: true, label: "الادوات الرئيسية" },
        ...mainTools,
      ];
    }
  } else {
    // If no user is authenticated, show a message or minimal items
    sidebarItems = [
      { isTitle: true, label: "الرجاء تسجيل الدخول" },
      { label: "تسجيل الدخول", path: "/login", icon: LogIn },
    ];
  }

  // Animation variants for page transitions
  const pageVariants = {
    initial: {
      opacity: 0,
      x: 20,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const routes = (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <Routes location={location}>
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
      </motion.div>
    </AnimatePresence>
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
