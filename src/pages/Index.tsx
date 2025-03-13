
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { PageTransition } from "@/components/layout/PageTransition";
import { Header } from "@/components/layout/Header";

const Index = () => {
  const { currentUser, userData, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (currentUser && userData && !loading) {
      navigate("/dashboard");
    }
  }, [currentUser, userData, loading, navigate]);

  return (
    <>
      <Header />
      <PageTransition>
        <div className="min-h-screen pt-20">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pb-16">
            <div className="container px-4 py-20 mx-auto flex flex-col lg:flex-row items-center justify-between">
              <div className="lg:w-1/2 mb-10 lg:mb-0">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  College Gate Pass
                  <span className="text-primary block mt-2">Management System</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                  A seamless digital solution for managing hostel gate passes. 
                  Request and approve passes with ease, enhancing campus safety and student mobility.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="font-medium"
                    onClick={() => navigate("/register")}
                  >
                    Get Started
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-medium"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="relative z-10 bg-white shadow-xl rounded-2xl p-4 border">
                  <img
                    src="/placeholder.svg"
                    alt="Gate Pass Example"
                    className="w-full rounded-xl"
                    width={500}
                    height={400}
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl -z-0"></div>
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl -z-0"></div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-background">
            <div className="container px-4 mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-primary"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Digital Requests</h3>
                  <p className="text-muted-foreground">
                    Submit gate pass requests digitally, eliminating paperwork and streamlining the process.
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-primary"
                    >
                      <circle cx="12" cy="12" r="10"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Instant Approvals</h3>
                  <p className="text-muted-foreground">
                    Wardens can view and approve requests instantly, improving response times.
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-primary"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Enhanced Security</h3>
                  <p className="text-muted-foreground">
                    Digital passes with verification improve campus security and student safety.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-muted py-8 border-t">
            <div className="container px-4 mx-auto text-center">
              <p className="text-muted-foreground">
                © {new Date().getFullYear()} College Gate Pass System. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </PageTransition>
    </>
  );
};

export default Index;
