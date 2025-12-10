import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Home, Info, Briefcase, UserPlus, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="bg-primary rounded-lg px-3 py-1.5 inline-block mb-4">
              <span className="text-primary-foreground">سرفانا</span>
            </div>
            <p className="text-secondary-foreground/80 mb-4">
              ربط العملاء بالمهنيين المهرة لجميع احتياجات خدماتك المنزلية.
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
            <h3 className="mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <Home className="h-5 w-5" />
                  <span>الرئيسية</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <Info className="h-5 w-5" />
                  <span>عنا</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <Briefcase className="h-5 w-5" />
                  <span>الخدمات</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <Mail className="h-5 w-5" />
                  <span>اتصل بنا</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* For Workers */}
          <div>
            <h3 className="mb-4">للعمال</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/signup"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>انضم كعامل</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-secondary-foreground/80 hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>لوحة التحكم</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4">اتصل بنا</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Mail className="h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-secondary-foreground/80">info@srvana.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-secondary-foreground/80">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-secondary-foreground/80">123 شارع الخدمات، المدينة، الولاية</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-secondary-foreground/80">
            © 2025 سرفانا. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
