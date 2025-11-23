import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { AboutPage } from "./components/AboutPage";
import { ServicesPage } from "./components/ServicesPage";
import { ContactPage } from "./components/ContactPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { ClientDashboard } from "./components/ClientDashboard";
import { WorkerDashboard } from "./components/WorkerDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserProfilePage } from "./components/UserProfilePage"; // Import UserProfilePage
import { BrowseUsersPage } from "./components/BrowseUsersPage"; // Import BrowseUsersPage
import { Routes, Route, useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();

  const showHeaderFooter = ![
    "/login",
    "/signup"
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
          <Route path="/profile/:userId" element={<UserProfilePage />} /> {/* New route for user profiles */}
          <Route path="/browse-users" element={<BrowseUsersPage />} /> {/* New route for browsing users */}
          <Route path="/client-dashboard/*" element={<ClientDashboard />} />
          <Route path="/worker-dashboard/*" element={<WorkerDashboard />} />
          <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
          <Route path="*" element={<HomePage />} /> {/* Fallback route */}
        </Routes>
      </div>
      {showHeaderFooter && <Footer />}
    </div>
  );
}
