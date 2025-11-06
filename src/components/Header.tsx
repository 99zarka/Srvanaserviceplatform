import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "home" },
    { name: "About", path: "about" },
    { name: "Services", path: "services" },
    { name: "Contact", path: "contact" },
  ];

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate("home")}
          >
            <div className="bg-primary rounded-lg px-3 py-1.5">
              <span className="text-primary-foreground">Srvana</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`hover:text-primary transition-colors ${
                  currentPage === item.path ? "text-primary" : "text-foreground"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => onNavigate("login")}
            >
              Log In
            </Button>
            <Button
              onClick={() => onNavigate("signup")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Sign Up
            </Button>
          </div>

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
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left hover:text-primary transition-colors ${
                    currentPage === item.path ? "text-primary" : "text-foreground"
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onNavigate("login");
                    setMobileMenuOpen(false);
                  }}
                >
                  Log In
                </Button>
                <Button
                  onClick={() => {
                    onNavigate("signup");
                    setMobileMenuOpen(false);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Sign Up
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
