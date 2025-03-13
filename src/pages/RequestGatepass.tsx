
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { GatepassRequest } from "@/components/student/GatepassRequest";

const RequestGatepass = () => {
  const { currentUser, userData, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (!loading && !currentUser) {
      navigate("/login");
      return;
    }

    // Check if user is a student
    if (!loading && userData && userData.role !== "student") {
      navigate("/dashboard");
      return;
    }

    // Check if student profile is complete
    if (!loading && userData && userData.role === "student" && !userData.isProfileComplete) {
      navigate("/dashboard");
      return;
    }
  }, [currentUser, userData, loading, navigate]);

  if (loading || !userData || !userData.isProfileComplete) {
    return null;
  }

  return (
    <>
      <Header />
      <PageTransition>
        <div className="min-h-screen pt-20 pb-10">
          <div className="container mx-auto px-4">
            <GatepassRequest />
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default RequestGatepass;
