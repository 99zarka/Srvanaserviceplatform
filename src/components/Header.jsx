import { Menu, X, Home, Users, Briefcase, Mail, CircleUser, LogOut, LogIn, UserPlus, Smile, Shield, Wrench, CheckCircle, Clock, XCircle, Bell, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import useNavigate here
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { getVerificationStatus } from "../redux/verificationSlice";
import { fetchNotifications, markNotificationAsRead } from "../redux/notificationSlice"; // Removed setLoadingMore for now, will add later if needed.
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
import SrvanaLogo from "/assets/srvana-logo.svg";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const authState = useSelector((state) => state.auth); // Access authState here
  const { isAuthenticated, user } = authState; // Destructure isAuthenticated and user

  let dashboardPath = "";
  if (user) {
    switch (user.user_type) {
      case "client":
        dashboardPath = "/dashboard";
        break;
      case "technician":
        dashboardPath = "/dashboard";
        break;
      case "admin":
        dashboardPath = "/dashboard";
        break;
      default:
        dashboardPath = "/"; // Fallback
    }
  }

  const navItems = [
    { name: "الرئيسية", path: "/", icon: Home },
    { name: "المستخدمين", path: "/browse-users", icon: Users }, // New link
    { name: "المشاريع", path: "/projects", icon: Briefcase }, // Added public projects link
    { name: "اتصل بنا", path: "/contact", icon: Mail },
  ];

  // Conditionally add navigation items if authenticated
  if (isAuthenticated && user) {
    // Determine dashboard link based on user type
    let userDashboardPath = "";
    let dashboardLabel = "";
    const userTypeName = user.user_type?.user_type_name || user.user_type;

    // Determine appropriate dashboard based on user type
    if (userTypeName === 'technician') {
      userDashboardPath = "/dashboard";
      dashboardLabel = "لوحة تحكم الفني";
    } else if (userTypeName === 'admin') {
      userDashboardPath = "/dashboard";
      dashboardLabel = "لوحة تحكم المدير";
    } else {
      // Default to client dashboard for clients and other user types
      userDashboardPath = "/dashboard";
      dashboardLabel = "لوحة تحكم العميل";
    }

    // Add Dashboard link (not a dropdown anymore)
    navItems.splice(1, 0, {
      name: "لوحة التحكم",
      path: "/dashboard",
      icon: Wrench
    });

    // Create a "Services" dropdown menu to reduce horizontal space
    const serviceItems = [
      { name: "الخدمات", path: "/services", icon: Briefcase, id: "service-services" },
      { name: "طلب خدمة", path: "/order/create", icon: Plus, id: "service-order-create" },
      { name: "تصفح الفنيين", path: "/technicians/browse", icon: Wrench, id: "service-technicians-browse" },
    ];

    // Add Services dropdown
    navItems.splice(2, 0, {
      name: "الخدمات",
      path: "#services",
      icon: Briefcase,
      isDropdown: true,
      dropdownItems: serviceItems
    });
  }

  return (
    <header className="bg-white/95 border-b-2 border-primary/10 sticky top-0 z-50 shadow-md backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="flex items-center h-20 gap-4">
          {/* Right Side: Logo + Home Link */}
          <div className="flex items-center gap-6 shrink-0">
            <Link
              to="/"
              className="flex items-center cursor-pointer group"
            >
              <img 
                src={SrvanaLogo} 
                alt="Srvana Logo" 
                className="h-10 w-auto group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <Link
              to="/"
              className={`hidden md:flex hover:text-primary transition-all duration-300 flex-row items-center gap-2 whitespace-nowrap font-semibold ${
                location.pathname === "/" ? "text-primary" : "text-neutral-700"
              }`}
            >
              <span>الرئيسية</span>
              <Home className="h-5 w-5" />
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center flex-1 justify-evenly" dir="rtl">
            {navItems.filter(item => item.path !== "/").map((item) => (
              item.isDropdown ? (
                <DropdownMenu key={item.path}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex flex-row items-center gap-2 whitespace-nowrap font-semibold text-neutral-700 hover:text-primary hover:bg-primary/5 transition-all duration-300"
                    >
                      <span>{item.name}</span>
                      {item.icon && <item.icon className="h-5 w-5" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" dir="rtl" className="min-w-[200px] shadow-lg border-primary/20">
                    {item.dropdownItems.map((dropdownItem) => (
                      <DropdownMenuItem 
                        key={dropdownItem.id || dropdownItem.path} 
                        asChild 
                        className="cursor-pointer hover:bg-primary/5 transition-colors"
                      >
                        <Link to={dropdownItem.path} className="flex items-center gap-2 py-2">
                          {dropdownItem.icon && <dropdownItem.icon className="h-4 w-4" />}
                          <span>{dropdownItem.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`hover:text-primary transition-all duration-300 flex flex-row items-center gap-2 whitespace-nowrap font-semibold ${
                    location.pathname === item.path ? "text-primary" : "text-neutral-700"
                  }`}
                >
                  <span>{item.name}</span>
                  {item.icon && <item.icon className="h-5 w-5" />}
                </Link>
              )
            ))}
          </nav>

          {/* Left Side: Auth Buttons */}
          <div className="hidden md:flex items-center shrink-0">
            <AuthSection />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden mr-auto p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-neutral-700" />
            ) : (
              <Menu className="h-6 w-6 text-neutral-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t-2 border-primary/10 bg-neutral-50 rounded-b-xl">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-start hover:text-primary hover:bg-white transition-all duration-300 flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${
                    location.pathname === item.path ? "text-primary bg-white shadow-sm" : "text-neutral-700"
                  }`}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t-2 border-primary/10 mt-4">
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
      // Get verification status for authenticated technicians
      const userTypeName = user.user_type?.user_type_name || user.user_type;
      if (userTypeName === 'technician' && user.id) {
        dispatch(getVerificationStatus(user.id));
      }
      // Fetch initial notifications for all authenticated users
      dispatch(fetchNotifications());

      // Optional: Set up polling interval (e.g., every minute)
      const intervalId = setInterval(() => {
        // Only fetch the first page for polling to keep unread count updated
        dispatch(fetchNotifications());
      }, 60 * 1000);

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
      <div className={`${isMobile ? "flex flex-col space-y-3" : "flex"} items-center gap-3`}>
        {/* Notification Dropdown - First */}
        <NotificationDropdown isMobile={isMobile} closeMenu={closeMenu} />

        {/* User Dropdown Menu - Second */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2 h-10 px-3 hover:bg-primary/5 hover:text-primary transition-all duration-300 font-medium"
            >
              <CircleUser className="h-5 w-5" />
              <span className="text-sm max-w-[100px] truncate">
                {user.first_name ? user.first_name.split(' ')[0] : user.username || "مستخدم"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" dir="rtl" className="min-w-[200px] shadow-lg border-primary/20">
            <DropdownMenuLabel className="font-bold text-primary">حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/5">
              <Link to={`/profile/${user.user_id}`} className="flex items-center gap-2 py-2">
                <CircleUser className="h-4 w-4" />
                <span>الملف الشخصي</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="text-danger hover:bg-danger/5 hover:text-danger cursor-pointer py-2"
            >
              <LogOut className="h-4 w-4 ml-2" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Become Technician Button - Third (Leftmost) */}
        {user.user_type?.user_type_name !== 'technician' && user.user_type?.user_type_name !== 'admin' && (
          <Button
            onClick={handleBecomeTechnician}
            className="flex items-center gap-2 bg-accent hover:bg-accent-600 text-neutral-900 h-10 px-4 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            size="sm"
          >
            <Wrench className="h-4 w-4" />
            <span className="text-sm">كن فنياً</span>
          </Button>
        )}

        {/* Verification Status Widget for Technicians */}
        {user.user_type?.user_type_name === 'technician' && (
          <VerificationStatusWidget
            verificationStatus={verificationState.verificationStatus}
            onBecomeTechnician={handleBecomeTechnician}
            isMobile={isMobile}
            compact={true}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`${isMobile ? "flex flex-col space-y-3" : "flex"} items-center gap-3`}>
      <Button
        asChild
        className="bg-primary hover:bg-primary-600 text-white flex items-center gap-2 h-10 px-5 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
        onClick={isMobile ? closeMenu : undefined}
      >
        <Link to="/login">
          <LogIn className="h-5 w-5" />
          <span>تسجيل الدخول</span>
        </Link>
      </Button>
      <Button
        variant="outline"
        asChild
        className="flex items-center gap-2 border-2 border-primary/30 hover:bg-primary/5 hover:border-primary text-primary h-10 px-5 font-semibold transition-all duration-300"
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
  const { allNotifications, unreadCount, hasMore, nextPageUrl, loadingMore } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
        navigate(`/dashboard/tasks/${notification.related_order}`);
      }
    } else if (notification.related_offer) {
      // Example: Navigate to a technician's offer response page or worker offers dashboard
      if (notification.notification_type === 'new_offer' || notification.notification_type === 'offer_rejected') {
        navigate(`/dashboard/client-offers`);
      } else if (notification.notification_type === 'new_direct_offer' || notification.notification_type === 'client_offer_rejected') {
         navigate(`/dashboard/client-offers`);
      }
    } else if (notification.related_dispute) {
      // Navigate to dispute details page or relevant order page
      navigate(`/disputes/${notification.related_dispute}`);
    }
    // Add more specific navigation logic as needed
  };

  // const displayNotifications = notifications.slice(0, 10); // Removed this line, now using allNotifications
  const displayNotifications = allNotifications;

  const handleLoadMore = () => {
    if (hasMore && nextPageUrl && !loadingMore) {
      dispatch(fetchNotifications(nextPageUrl));
    }
  };

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
          {hasMore && (
            <Button 
              variant="ghost" 
              onClick={handleLoadMore} 
              disabled={loadingMore}
              className="mt-2"
            >
              {loadingMore ? "تحميل المزيد..." : "تحميل المزيد"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'animate-bell-ring' : ''}`} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
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
          {hasMore && (
            <div className="p-2 text-center">
              <Button 
                variant="ghost" 
                onClick={handleLoadMore} 
                disabled={loadingMore}
                className="w-full"
              >
                {loadingMore ? "تحميل المزيد..." : "تحميل المزيد"}
              </Button>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function VerificationStatusWidget({ verificationStatus, onBecomeTechnician, isMobile = false, compact = false }) {
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
      color: "text-yellow-600 bg-yellow-50 border-yellow-20",
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
  if (compact) {
    return (
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-md border ${config.color} h-8`}>
        <IconComponent className="h-4 w-4" />
        <span className="text-xs font-medium">{config.text}</span>
      </div>
    );
  }

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
