import { useState } from "react";
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

type PageType = 
  | "home" 
  | "about" 
  | "services" 
  | "contact" 
  | "login" 
  | "signup"
  | "client-dashboard"
  | "worker-dashboard"
  | "admin-dashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");

  const navigate = (page: string) => {
    setCurrentPage(page as PageType);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={navigate} />;
      case "about":
        return <AboutPage />;
      case "services":
        return <ServicesPage onNavigate={navigate} />;
      case "contact":
        return <ContactPage />;
      case "login":
        return <LoginPage onNavigate={navigate} />;
      case "signup":
        return <SignupPage onNavigate={navigate} />;
      case "client-dashboard":
        return <ClientDashboard onNavigate={navigate} />;
      case "worker-dashboard":
        return <WorkerDashboard onNavigate={navigate} />;
      case "admin-dashboard":
        return <AdminDashboard onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  const showHeaderFooter = ![
    "login",
    "signup",
    "client-dashboard",
    "worker-dashboard",
    "admin-dashboard",
  ].includes(currentPage);

  return (
    <div className="min-h-screen flex flex-col">
      {showHeaderFooter && (
        <Header currentPage={currentPage} onNavigate={navigate} />
      )}
      <div className="flex-1">
        {renderPage()}
      </div>
      {showHeaderFooter && <Footer onNavigate={navigate} />}
    </div>
  );
}
