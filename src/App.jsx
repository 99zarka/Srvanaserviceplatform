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
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import AIAssistantPage from "./components/ai/AIAssistantPage";

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
import { PublicRoute } from "./components/PublicRoute";

export default function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Hide loader after 2.3 seconds
    const loaderTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2300);

    // Show content with fade-in after loader disappears
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 2300);

    return () => {
      clearTimeout(loaderTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  const showHeaderFooter = ![
    "/login",
    "/signup",
  ].includes(location.pathname) &&
    !location.pathname.startsWith("/dashboard") &&
    !location.pathname.startsWith("/disputes") &&
    !location.pathname.startsWith("/transactions");

  return (
    <>
      {/* Loader */}
      {isLoading && (
        <div className="loader-overlay">
          <div className="spinner">
            <div className="spinner1"></div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div 
        className={`min-h-screen flex flex-col ${showContent ? 'fade-in-content' : 'hidden-content'}`} 
        dir="rtl"
        style={{ transition: 'opacity 0.8s ease-in' }}
      >
        {showHeaderFooter && <Header />}
        <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } />
          <Route path="/technician-verification" element={<TechnicianVerificationPage />} />
          <Route path="/profile/:userId" element={<UserProfilePage />} />
          <Route path="/browse-users" element={<BrowseUsersPage />} />
          <Route path="/assistant" element={
            <ProtectedRoute>
              <AIAssistantPage />
            </ProtectedRoute>
          } />
          
          {/* Public Project Routes */}
          <Route path="/projects" element={<PublicProjectsList />} />
          <Route path="/projects/:order_id" element={<ProjectDetail />} />

          {/* Service Ordering Routes */}
          <Route path="/order/create" element={
            <ProtectedRoute>
              <OrderCreateForm />
            </ProtectedRoute>
          } />
          {/* <Route path="/orders/dashboard" element={<ClientOrdersDashboard />} /> */} {/* Removed */}
          <Route path="/technicians/browse" element={<TechnicianBrowse />} />
          <Route path="/offer/:technicianId" element={
            <ProtectedRoute>
              <DirectOfferForm />
            </ProtectedRoute>
          } />
          {/* <Route path="/client-offers" element={<ClientOffersPage />} /> */} {/* Removed */}
          <Route path="/transactions/:transactionId" element={
            <ProtectedRoute>
              <TransactionDetailPage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <UnifiedDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
      {showHeaderFooter && <Footer />}
      <Toaster />
      <NotificationDisplay />
    </div>
    </>
  );
}
