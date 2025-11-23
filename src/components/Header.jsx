import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const authState = useSelector((state) => state.auth); // Access authState here
  const { isAuthenticated, user } = authState; // Destructure isAuthenticated and user

  const navItems = [
    { name: "الرئيسية", path: "/" },
    { name: "تصفح المستخدمين", path: "/browse-users" }, // New link
    { name: "الخدمات", path: "/services" },
    { name: "اتصل بنا", path: "/contact" },
  ];

  // Conditionally add "My Profile" link if authenticated
  if (isAuthenticated && user) {
    navItems.splice(2, 0, { name: "ملفي الشخصي", path: `/profile/${user.user_id}` });
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center cursor-pointer"
          >
            <div className="bg-primary rounded-lg px-3 py-1.5">
              <span className="text-primary-foreground">Srvana</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`hover:text-primary transition-colors ${
                  location.pathname === item.path ? "text-primary" : "text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <AuthSection />

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-start hover:text-primary transition-colors ${
                    location.pathname === item.path ? "text-primary" : "text-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <AuthSection isMobile={true} closeMenu={() => setMobileMenuOpen(false)} />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function AuthSection({ isMobile = false, closeMenu }) {
  const authState = useSelector((state) => state.auth);
  const { isAuthenticated, user } = authState;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Debug: Log the current auth state
  console.log('AuthSection - isAuthenticated:', isAuthenticated, 'user:', user);

  const handleLogout = () => {
    dispatch(logout());
    if (closeMenu) closeMenu();
    navigate("/login");
  };

  if (isAuthenticated && user) {
    return (
      <div className={`${isMobile ? "flex flex-col space-y-2" : "hidden md:flex"} items-center space-x-4`}>
        <span className="text-foreground">
          مرحبًا, {user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.username || user.email || "مستخدم"}
        </span>
        <Button
          variant="ghost"
          onClick={handleLogout}
        >
          تسجيل الخروج
        </Button>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? "flex flex-col space-y-2" : "hidden md:flex"} items-center space-x-4`}>
      <Button
        variant="ghost"
        asChild
        onClick={isMobile ? closeMenu : undefined}
      >
        <Link to="/login">تسجيل الدخول</Link>
      </Button>
      <Button
        asChild
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
        onClick={isMobile ? closeMenu : undefined}
      >
        <Link to="/signup">إنشاء حساب</Link>
      </Button>
    </div>
  );
}
