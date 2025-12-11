import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { AboutPage } from "./components/AboutPage";
import { ServicesPage } from "./components/ServicesPage";
import { ContactPage } from "./components/ContactPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { TechnicianVerificationPage } from "./components/TechnicianVerificationPage";
import { UnifiedDashboard } from "./components/UnifiedDashboard";
import { UserProfilePage } from "./components/UserProfilePage";
import { BrowseUsersPage } from "./components/BrowseUsersPage";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

// Import new service ordering components
import OrderCreateForm from "./components/service-ordering/OrderCreateForm";
// import ClientOrdersDashboard from "./components/service-ordering/ClientOrdersDashboard"; // Removed
import TechnicianBrowse from "./components/service-ordering/TechnicianBrowse";
import DirectOfferForm from "./components/service-ordering/DirectOfferForm";
// import { ClientOffersPage } from "./components/ClientOffersPage"; // Removed
import { DisputeDetailPage } from "./components/DisputeDetailPage";
import { TransactionDetailPage } from "./components/TransactionDetailPage";
import { NotificationDisplay } from "./components/NotificationDisplay";

// Import public project components
import PublicProjectsList from "./components/public/PublicProjectsList";
import ProjectDetail from "./components/public/ProjectDetail";


export default function App() {
  const location = useLocation();

  const showHeaderFooter = ![
    "/login",
    "/signup",
    "/technician-verification"
  ].includes(location.pathname) &&
    !location.pathname.startsWith("/dashboard") &&
    !location.pathname.startsWith("/disputes") &&
    !location.pathname.startsWith("/transactions");

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      {showHeaderFooter && <Header />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/technician-verification" element={<TechnicianVerificationPage />} />
          <Route path="/profile/:userId" element={<UserProfilePage />} />
          <Route path="/browse-users" element={<BrowseUsersPage />} />
          
          {/* Public Project Routes */}
          <Route path="/projects" element={<PublicProjectsList />} />
          <Route path="/projects/:order_id" element={<ProjectDetail />} />

          {/* Service Ordering Routes */}
          <Route path="/order/create" element={<OrderCreateForm />} />
          {/* <Route path="/orders/dashboard" element={<ClientOrdersDashboard />} /> */} {/* Removed */}
          <Route path="/technicians/browse" element={<TechnicianBrowse />} />
          <Route path="/offer/:technicianId" element={<DirectOfferForm />} />
          {/* <Route path="/client-offers" element={<ClientOffersPage />} /> */} {/* Removed */}
          <Route path="/disputes/:orderId" element={<DisputeDetailPage />} />
          <Route path="/transactions/:transactionId" element={<TransactionDetailPage />} />

          <Route path="/dashboard/*" element={<UnifiedDashboard />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
      {showHeaderFooter && <Footer />}
      <Toaster />
      <NotificationDisplay />
    </div>
  );
}
