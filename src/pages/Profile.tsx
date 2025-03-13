
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { StudentProfile } from "@/components/student/StudentProfile";
import { WardenProfile } from "@/components/warden/WardenProfile";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { currentUser, userData, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, loading, navigate]);

  if (loading || !userData) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading profile...</p>
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
              <StudentProfile />
            ) : (
              <WardenProfile />
            )}
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default Profile;
