
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/layout/PageTransition";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { StudentDashboard } from "@/components/student/StudentDashboard";
import { WardenDashboard } from "@/components/warden/WardenDashboard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { StudentRegistration } from "@/components/student/StudentRegistration";

const Dashboard = () => {
  const { currentUser, userData, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, loading, navigate]);

  // Show loading state
  if (loading || !userData) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  // If student profile is not complete, show registration form
  if (userData.role === "student" && !userData.isProfileComplete) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 pb-10">
          <div className="container mx-auto px-4">
            <StudentRegistration />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <PageTransition>
        <div className="min-h-screen pt-20 pb-10">
          <div className="container mx-auto px-4">
            {userData.role === "student" ? (
              <StudentDashboard />
            ) : (
              <WardenDashboard />
            )}
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default Dashboard;
