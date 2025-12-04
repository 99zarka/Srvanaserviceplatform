import { Menu, X, Home, Users, Briefcase, Mail, CircleUser, LogOut, LogIn, UserPlus, Smile, Shield, Wrench, CheckCircle, Clock, XCircle, Bell, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import useNavigate here
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { getVerificationStatus } from "../redux/verificationSlice";
import { fetchNotifications, markNotificationAsRead } from "../redux/notificationSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const authState = useSelector((state) => state.auth); // Access authState here
  const { isAuthenticated, user } = authState; // Destructure isAuthenticated and user

  let dashboardPath = "";
  if (user) {
    switch (user.user_type) {
      case "client":
        dashboardPath = "/client-dashboard";
        break;
      case "worker":
        dashboardPath = "/worker-dashboard";
        break;
      case "admin":
        dashboardPath = "/admin-dashboard";
        break;
      default:
        dashboardPath = "/"; // Fallback
    }
  }

  const navItems = [
    { name: "الرئيسية", path: "/", icon: Home },
    { name: "تصفح المستخدمين", path: "/browse-users", icon: Users }, // New link
    { name: "الخدمات", path: "/services", icon: Briefcase },
    { name: "اتصل بنا", path: "/contact", icon: Mail },
  ];

  // Conditionally add navigation items if authenticated
  if (isAuthenticated && user) {
    // Determine dashboard link based on user type
    let userDashboardPath = "";
    let dashboardLabel = "";
    switch (user.user_type) {
      case "client":
        userDashboardPath = "/client-dashboard";
        dashboardLabel = "لوحة تحكم العميل";
        break;
      case "worker":
        userDashboardPath = "/worker-dashboard";
        dashboardLabel = "لوحة تحكم الفني";
        break;
      case "admin":
        userDashboardPath = "/admin-dashboard";
        dashboardLabel = "لوحة تحكم المدير";
        break;
      default:
        userDashboardPath = "/";
        dashboardLabel = "لوحة التحكم";
    }

    // Add Dashboard dropdown/link
    navItems.splice(1, 0, { 
      name: dashboardLabel, 
      path: userDashboardPath, 
      icon: Wrench,
      isDropdown: true, // Indicate this item should be a dropdown
      dropdownItems: [
        { name: "لوحة تحكم العميل", path: "/client-dashboard" },
        { name: "لوحة تحكم الفني", path: "/worker-dashboard" },
        { name: "لوحة تحكم المدير", path: "/admin-dashboard" },
      ]
    });

    // Add service ordering links
    navItems.splice(3, 0, { name: "طلب خدمة", path: "/order/create", icon: Plus });
    navItems.splice(3, 0, { name: "طلباتي", path: "/orders/dashboard", icon: Briefcase });
    navItems.splice(3, 0, { name: "تصفح الفنيين", path: "/technicians/browse", icon: Wrench });
    navItems.splice(3, 0, { name: "عروضي", path: "/client-offers", icon: Briefcase }); // Add client offers link for clients
    
    // Add profile link
    navItems.splice(3, 0, { name: "ملفي الشخصي", path: `/profile/${user.user_id}`, icon: CircleUser });
    
    // Add technician verification link for workers
    if (user.user_type !== 'worker') { // Assuming 'worker' is the string for worker user type
      navItems.splice(4, 0, { name: "تحقق الفنيين", path: "/technician-verification", icon: Shield });
    }
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center cursor-pointer"
          >
            <div className="bg-primary rounded-lg px-3 py-1.5">
              <span className="text-primary-foreground">سرفانا</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.isDropdown ? (
                <DropdownMenu key={item.path}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" dir="rtl">
                    {item.dropdownItems.map((dropdownItem) => (
                      <DropdownMenuItem key={dropdownItem.path} asChild>
                        <Link to={dropdownItem.path}>{dropdownItem.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`hover:text-primary transition-colors flex items-center space-x-2 ${
                    location.pathname === item.path ? "text-primary" : "text-foreground"
                  }`}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.name}</span>
                </Link>
              )
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
                  className={`text-start hover:text-primary transition-colors flex items-center space-x-2 ${
                    location.pathname === item.path ? "text-primary" : "text-foreground"
                  }`}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.name}</span>
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
  const verificationState = useSelector((state) => state.verification);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Debug: Log the current auth state
  console.log('AuthSection - isAuthenticated:', isAuthenticated, 'user:', user);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Get verification status for authenticated workers
      if (user.user_type === 'worker' && user.id) {
        dispatch(getVerificationStatus(user.id));
      }
      // Fetch notifications for all authenticated users
      dispatch(fetchNotifications());
      
      // Optional: Set up polling interval (e.g., every minute)
      const intervalId = setInterval(() => {
        dispatch(fetchNotifications());
      }, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    if (closeMenu) closeMenu();
    navigate("/login");
  };

  const handleBecomeTechnician = () => {
    navigate("/technician-verification");
    if (closeMenu) closeMenu();
  };

  if (isAuthenticated && user) {
    return (
      <div className={`${isMobile ? "flex flex-col space-y-2" : "hidden md:flex"} items-center space-x-4`}>
        {/* Welcome Message */}
        <span className="text-foreground flex items-center space-x-2">
          <Smile className="h-5 w-5" />
          <span>
            مرحبًا, {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.username || user.email || "مستخدم"}
          </span>
        </span>

        {/* Notification Dropdown */}
        <NotificationDropdown isMobile={isMobile} closeMenu={closeMenu} />

        {/* Verification Status Widget for Workers */}
        {user.user_type === 'worker' && (
          <VerificationStatusWidget 
            verificationStatus={verificationState.verificationStatus}
            onBecomeTechnician={handleBecomeTechnician}
            isMobile={isMobile}
          />
        )}

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="flex items-center space-x-2"
        >
          <LogOut className="h-5 w-5" />
          <span>تسجيل الخروج</span>
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
        className="flex items-center space-x-2"
      >
        <Link to="/login">
          <LogIn className="h-5 w-5" />
          <span>تسجيل الدخول</span>
        </Link>
      </Button>
      <Button
        asChild
        className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2"
        onClick={isMobile ? closeMenu : undefined}
      >
        <Link to="/signup">
          <UserPlus className="h-5 w-5" />
          <span>إنشاء حساب</span>
        </Link>
      </Button>
    </div>
  );
}

function NotificationDropdown({ isMobile, closeMenu }) {
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  const [open, setOpen] = useState(false);

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      dispatch(markNotificationAsRead(notification.id));
    }

    setOpen(false); // Close dropdown after clicking a notification
    if (isMobile && closeMenu) closeMenu();

    // Handle navigation based on notification type and related entities
    if (notification.related_order) {
      // Example: Navigate to a client's order detail page
      if (notification.notification_type === 'order_created' || notification.notification_type === 'offer_accepted' || notification.notification_type === 'client_offer_accepted') {
        navigate(`/orders/dashboard/${notification.related_order}`);
      } else {
        // Default to worker task details if it's a technician related notification
        navigate(`/worker-dashboard/tasks/${notification.related_order}`);
      }
    } else if (notification.related_offer) {
      // Example: Navigate to a technician's offer response page or worker offers dashboard
      if (notification.notification_type === 'new_offer' || notification.notification_type === 'offer_rejected') {
        navigate(`/worker-dashboard/client-offers`);
      } else if (notification.notification_type === 'new_direct_offer' || notification.notification_type === 'client_offer_rejected') {
         navigate(`/worker-dashboard/client-offers`);
      }
    }
    // Add more specific navigation logic as needed
  };

  const displayNotifications = notifications.slice(0, 10); // Show last 10 notifications

  if (isMobile) {
    return (
      <div className="flex flex-col space-y-2 w-full">
        <div className="flex items-center justify-between">
          <span className="font-semibold">الإشعارات</span>
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
        </div>
        <div className="flex flex-col space-y-2 border rounded-md p-2 max-h-60 overflow-y-auto">
          {displayNotifications.length === 0 ? (
            <span className="text-sm text-muted-foreground p-2">لا توجد إشعارات</span>
          ) : (
            displayNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-2 rounded-md text-sm cursor-pointer ${notification.is_read ? 'bg-background' : 'bg-muted/50 font-medium'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="font-semibold">{notification.title}</div>
                <div className="text-xs text-muted-foreground">{notification.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" dir="rtl">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>الإشعارات</span>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} غير مقروء</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {displayNotifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              لا توجد إشعارات جديدة
            </div>
          ) : (
            displayNotifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.is_read ? 'bg-muted/30' : ''}`}
                onSelect={(e) => {
                    e.preventDefault(); // Prevent closing immediately to allow reading
                    handleNotificationClick(notification);
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-sm font-semibold ${!notification.is_read ? 'text-primary' : ''}`}>
                    {notification.title}
                  </span>
                  {!notification.is_read && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {new Date(notification.created_at).toLocaleDateString('ar-EG')}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function VerificationStatusWidget({ verificationStatus, onBecomeTechnician, isMobile = false }) {
  if (!verificationStatus) {
    // No verification document submitted yet
    return (
      <Button
        onClick={onBecomeTechnician}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
        size={isMobile ? "sm" : "default"}
      >
        <Wrench className="h-4 w-4" />
        <span>أصبح فنياً</span>
      </Button>
    );
  }

  const status = verificationStatus.verification_status;
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      text: "قيد المراجعة",
      showButton: false
    },
    approved: {
      icon: CheckCircle,
      color: "text-green-600 bg-green-50 border-green-200",
      text: "مفعل",
      showButton: false
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600 bg-red-50 border-red-200",
      text: "مرفوض",
      showButton: true
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const IconComponent = config.icon;

  if (isMobile) {
    // Mobile layout - stack vertically
    return (
      <div className="flex flex-col space-y-2">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-md border ${config.color}`}>
          <IconComponent className="h-4 w-4" />
          <span className="text-sm font-medium">{config.text}</span>
        </div>
        {config.showButton && (
          <Button
            onClick={onBecomeTechnician}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Wrench className="h-4 w-4" />
            <span>أصبح فنياً</span>
          </Button>
        )}
      </div>
    );
  }

  // Desktop layout - horizontal
  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-md border ${config.color}`}>
        <IconComponent className="h-4 w-4" />
        <span className="text-sm font-medium">{config.text}</span>
      </div>
      {config.showButton && (
        <Button
          onClick={onBecomeTechnician}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <Wrench className="h-4 w-4" />
          <span>أصبح فنياً</span>
        </Button>
      )}
    </div>
  );
}
