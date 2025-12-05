import { Home, FileText, CreditCard, MessageSquare, User, Flag, DollarSign, ShoppingCart } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector
import { ClientOverview } from "./client-dashboard/ClientOverview";
import { ClientRequests } from "./client-dashboard/ClientRequests";
import { ClientMessages } from "./client-dashboard/ClientMessages";
import { ClientDisputes } from "./client-dashboard/ClientDisputes"; // Import ClientDisputes
import { ClientFinancials } from "./client-dashboard/ClientFinancials"; // Import ClientFinancials
import ClientOrdersAndOffers from './client-dashboard/ClientOrdersAndOffers'; // Import new component
import EditOrderPage from './client-dashboard/EditOrderPage'; // Import EditOrderPage
import ViewOrderPage from './client-dashboard/ViewOrderPage'; // Import ViewOrderPage

export function ClientDashboard() {
  const { user } = useSelector((state) => state.auth); // Get user from Redux state
  const userId = user?.user_id; // Get user ID
  const userName = user ? `${user.first_name} ${user.last_name}` : "اسم المستخدم"; // Dynamic user name
  const userRole = user ? user.user_type?.user_type_name : "عميل"; // Dynamic user role
  const userProfileImage = user?.profile_photo || null; // Get user profile image from profile_photo field

  const sidebarItems = [
    { icon: Home, label: "نظرة عامة", path: "/client-dashboard" },
    { icon: FileText, label: "طلباتي", path: "/client-dashboard/requests" },
    { icon: DollarSign, label: "الماليات والمعاملات", path: "/client-dashboard/financials" }, // Combined financial page with updated label
    { icon: ShoppingCart, label: "الطلبات والعروض", path: "/client-dashboard/orders-offers" }, // New item for Orders and Offers
    { icon: MessageSquare, label: "الرسائل", path: "/client-dashboard/messages" },
    { icon: Flag, label: "النزاعات", path: "/client-dashboard/disputes" }, // New item for Disputes
    { icon: User, label: "الملف الشخصي", path: `/profile/${userId}` }, // Use dynamic user ID
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userName={userName} // Pass dynamic user name
      userRole={userRole} // Pass dynamic user role
      userProfileImage={userProfileImage} // Pass dynamic user profile image
      userId={userId} // Pass dynamic user ID
    >
      <Routes>
        <Route index element={<ClientOverview />} />
        <Route path="requests" element={<ClientRequests />} />
        <Route path="financials" element={<ClientFinancials />} /> {/* New route for combined financials */}
        <Route path="orders-offers" element={<ClientOrdersAndOffers />} /> {/* Route for orders and offers */}
        <Route path="orders-offers/edit/:orderId" element={<EditOrderPage />} /> {/* New route for editing an order */}
        <Route path="orders-offers/view/:orderId" element={<ViewOrderPage />} /> {/* New route for viewing an order */}
        <Route path="messages" element={<ClientMessages />} />
        <Route path="disputes" element={<ClientDisputes />} /> {/* New route for disputes */}
      </Routes>
    </DashboardLayout>
  );
}
