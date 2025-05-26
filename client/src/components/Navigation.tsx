import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  History,
  ChevronRight,
} from "lucide-react";
import AuthDialog from "./AuthDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success("Successfully logged out!");
      setIsMobileMenuOpen(false);
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [{ path: "/", label: "Home" }];

  const sectionLinks = [
    { id: "features-section", label: "Features" },
    { id: "ai-models-section", label: "AI Models" },
    { id: "upload-section", label: "Upload" },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 73;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`w-full py-4 px-6 md:px-10 fixed top-0 left-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm"
          : "bg-white border-b border-honey/20"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-2"
          onClick={(e) => {
            if (location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <div className="w-11 h-11 rounded-full bg-honey flex items-center justify-center">
            <img src="/bee.png" alt="BuzzDetect Logo" className="w-8 h-8" />
          </div>
          <span className="text-2xl font-bold text-hive">
            Buzz<span className="text-honey">Detect</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={(e) => {
                if (link.path === "/" && location.pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className={`text-hive hover:text-honey font-medium transition-colors ${
                isActive(link.path) ? "text-honey" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
          {location.pathname === "/" &&
            sectionLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-hive hover:text-honey font-medium transition-colors"
              >
                {link.label}
              </button>
            ))}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-hive font-medium">
                  {user.email?.split("@")[0].charAt(0).toUpperCase() +
                    user.email?.split("@")[0].slice(1)}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-honey/20 text-honey">
                          {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.email?.split("@")[0].charAt(0).toUpperCase() +
                            user.email?.split("@")[0].slice(1)}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <AuthDialog>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-hive hover:text-honey"
                >
                  <User size={16} />
                  <span>Sign In</span>
                </Button>
              </AuthDialog>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-hive hover:text-honey transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 top-[73px] bg-white z-50 overflow-y-auto"
            style={{ height: "calc(100vh - 73px)" }}
          >
            <div className="min-h-full flex flex-col">
              <nav className="flex flex-col py-4">
                {/* Main Navigation */}
                <div className="px-4 mb-2">
                  <h3 className="text-xs font-semibold text-hive/60 uppercase tracking-wider mb-2">
                    Navigation
                  </h3>
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-4 py-3 text-hive hover:text-honey hover:bg-honey/5 font-medium transition-colors flex items-center justify-between rounded-lg ${
                        isActive(link.path) ? "text-honey bg-honey/5" : ""
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{link.label}</span>
                      <ChevronRight size={16} className="text-honey/50" />
                    </Link>
                  ))}
                </div>

                {/* Section Links */}
                {location.pathname === "/" && (
                  <div className="px-4 mb-2">
                    <h3 className="text-xs font-semibold text-hive/60 uppercase tracking-wider mb-2">
                      Sections
                    </h3>
                    {sectionLinks.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => scrollToSection(link.id)}
                        className="w-full px-4 py-3 text-hive hover:text-honey hover:bg-honey/5 font-medium transition-colors flex items-center justify-between rounded-lg"
                      >
                        <span>{link.label}</span>
                        <ChevronRight size={16} className="text-honey/50" />
                      </button>
                    ))}
                  </div>
                )}

                {/* User Section */}
                <div className="px-4 mt-4 pt-4 border-t border-honey/20">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 bg-honey/5 rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-honey/20 text-honey text-lg">
                            {user.email?.[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-base font-medium text-hive">
                            {user.email?.split("@")[0].charAt(0).toUpperCase() +
                              user.email?.split("@")[0].slice(1)}
                          </p>
                          <p className="text-sm text-hive-light">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-between py-3 px-4 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <LogOut size={20} />
                            <span>Log out</span>
                          </div>
                          <ChevronRight size={16} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <AuthDialog>
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center space-x-2 py-6 bg-honey hover:bg-honey/10 text-hive font-bold border-honey/20"
                      >
                        <User size={20} />
                        <span>Sign In</span>
                      </Button>
                    </AuthDialog>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navigation;
