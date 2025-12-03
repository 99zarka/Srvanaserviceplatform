import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { AboutPage } from "./components/AboutPage";
import { ServicesPage } from "./components/ServicesPage";
import { ContactPage } from "./components/ContactPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { TechnicianVerificationPage } from "./components/TechnicianVerificationPage";
import { ClientDashboard } from "./components/ClientDashboard";
import { WorkerDashboard } from "./components/WorkerDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserProfilePage } from "./components/UserProfilePage"; // Import UserProfilePage
import { BrowseUsersPage } from "./components/BrowseUsersPage"; // Import BrowseUsersPage
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner"; // Import Toaster for sonner notifications

// Import new service ordering components
import OrderCreateForm from "./components/service-ordering/OrderCreateForm";
import ClientOrdersDashboard from "./components/service-ordering/ClientOrdersDashboard";
import TechnicianBrowse from "./components/service-ordering/TechnicianBrowse";
import DirectOfferForm from "./components/service-ordering/DirectOfferForm"; // Import DirectOfferForm
import { ClientOffersPage } from "./components/ClientOffersPage"; // Import ClientOffersPage
import EditOfferForm from "./components/EditOfferForm"; // Import EditOfferForm

export default function App() {
  const location = useLocation();

  const showHeaderFooter = ![
    "/login",
    "/signup",
    "/technician-verification"
  ].includes(location.pathname) &&
    !location.pathname.startsWith("/client-dashboard") &&
    !location.pathname.startsWith("/worker-dashboard") &&
    !location.pathname.startsWith("/admin-dashboard"); // Exclude browse users page

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
          <Route path="/profile/:userId" element={<UserProfilePage />} /> {/* New route for user profiles */}
          <Route path="/browse-users" element={<BrowseUsersPage />} /> {/* New route for browsing users */}
          
          {/* Service Ordering Routes */}
          <Route path="/order/create" element={<OrderCreateForm />} />
          <Route path="/orders/dashboard" element={<ClientOrdersDashboard />} />
          <Route path="/technicians/browse" element={<TechnicianBrowse />} />
          {/* DirectHirePage route removed as its functionality is integrated into UserProfilePage */}
          <Route path="/offer/:technicianId" element={<DirectOfferForm />} /> {/* New route for direct offers */}
          <Route path="/client-offers" element={<ClientOffersPage />} /> {/* New route for client offers */}
          <Route path="/edit-offer/:orderId" element={<EditOfferForm />} /> {/* New route for editing offers */}
          
          <Route path="/client-dashboard/*" element={<ClientDashboard />} />
          <Route path="/worker-dashboard/*" element={<WorkerDashboard />} />
          <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
          <Route path="*" element={<HomePage />} /> {/* Fallback route */}
        </Routes>
      </div>
      {showHeaderFooter && <Footer />}
      <Toaster />
    </div>
  );
}
