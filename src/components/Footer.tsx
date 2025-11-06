import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="bg-primary rounded-lg px-3 py-1.5 inline-block mb-4">
              <span className="text-primary-foreground">Srvana</span>
            </div>
            <p className="text-secondary-foreground/80 mb-4">
              Connecting clients with skilled professionals for all your home service needs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate("home")}
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("about")}
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("services")}
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("contact")}
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* For Workers */}
          <div>
            <h3 className="mb-4">For Workers</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate("signup")}
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Join as Worker
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("worker-dashboard")}
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  Worker Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-secondary-foreground/80">info@srvana.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-secondary-foreground/80">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-secondary-foreground/80">123 Service St, City, State</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-secondary-foreground/80">
            © 2025 Srvana. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
