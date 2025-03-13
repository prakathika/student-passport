
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Header = () => {
  const { currentUser, userData, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle mobile menu close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 glassmorphism border-b",
        isScrolled ? "py-2" : "py-4"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-primary font-bold text-xl tracking-tight flex items-center gap-2"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20 
            }}
          >
            <span className="bg-primary text-white rounded-lg p-1.5 inline-block">GP</span>
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            GatePass
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {currentUser ? (
            <>
              {userData?.role === "student" ? (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/request-gatepass">Request Pass</NavLink>
                  <NavLink to="/my-gatepasses">My Passes</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/pending-requests">Pending Requests</NavLink>
                  <NavLink to="/approved-requests">Approved Requests</NavLink>
                </>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 px-3">
                    <User size={18} className="text-muted-foreground" />
                    <span className="ml-1 max-w-[100px] truncate">
                      {userData?.displayName || "Profile"}
                    </span>
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{userData?.displayName}</p>
                    <p className="text-xs text-muted-foreground">{userData?.email}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      Role: {userData?.role}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => navigate("/profile")}
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/login">
                <Button variant="ghost">Login</Button>
              </NavLink>
              <NavLink to="/register">
                <Button>Register</Button>
              </NavLink>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X size={24} className="text-foreground" />
          ) : (
            <Menu size={24} className="text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden glassmorphism border-b"
          >
            <div className="container px-4 py-4 space-y-3">
              {currentUser ? (
                <>
                  {userData?.role === "student" ? (
                    <>
                      <MobileNavLink to="/dashboard">Dashboard</MobileNavLink>
                      <MobileNavLink to="/request-gatepass">Request Pass</MobileNavLink>
                      <MobileNavLink to="/my-gatepasses">My Passes</MobileNavLink>
                    </>
                  ) : (
                    <>
                      <MobileNavLink to="/dashboard">Dashboard</MobileNavLink>
                      <MobileNavLink to="/pending-requests">Pending Requests</MobileNavLink>
                      <MobileNavLink to="/approved-requests">Approved Requests</MobileNavLink>
                    </>
                  )}
                  <MobileNavLink to="/profile">Profile</MobileNavLink>
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <MobileNavLink to="/about">About</MobileNavLink>
                  <MobileNavLink to="/login">Login</MobileNavLink>
                  <MobileNavLink to="/register">Register</MobileNavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "inline-flex relative px-1 py-2 text-sm font-medium transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="navigation-underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
};

const MobileNavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "block px-2 py-2 text-sm rounded-md transition-colors",
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "hover:bg-muted"
      )}
    >
      {children}
    </Link>
  );
};
