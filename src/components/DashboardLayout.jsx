import { LogOut, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function DashboardLayout({
  children,
  sidebarItems,
  userName,
  userRole,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-muted">
      {/* Mobile header */}
      <div className="lg:hidden bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/">
            <div className="bg-primary rounded-lg px-3 py-1.5 cursor-pointer">
              <span className="text-primary-foreground">Srvana</span>
            </div>
          </Link>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-sidebar text-sidebar-foreground
            transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-sidebar-border hidden lg:block">
              <Link to="/">
                <div className="bg-primary rounded-lg px-3 py-1.5 inline-block cursor-pointer">
                  <span className="text-primary-foreground">Srvana</span>
                </div>
              </Link>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-sidebar-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sidebar-foreground">{userName}</div>
                  <p className="text-sidebar-foreground/70">{userRole}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {sidebarItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-colors
                    ${
                      location.pathname === item.path
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-sidebar-border">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                asChild
              >
                <Link to="/">
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </Link>
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
