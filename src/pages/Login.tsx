
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { PageTransition } from "@/components/layout/PageTransition";
import { Header } from "@/components/layout/Header";

const Login = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && userData) {
      navigate("/dashboard");
    }
  }, [currentUser, userData, navigate]);

  return (
    <>
      <Header />
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center p-4 pt-20">
          <AuthForm mode="login" />
        </div>
      </PageTransition>
    </>
  );
};

export default Login;
