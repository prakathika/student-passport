
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Auto-redirect to home after 3 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <AlertTitle className="text-xl font-bold">Page Not Found</AlertTitle>
          <AlertDescription>
            The page you are looking for does not exist or has been moved.
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            You will be redirected to the home page in 3 seconds...
          </p>
          
          <Button 
            size="lg" 
            className="w-full" 
            onClick={() => navigate("/")}
          >
            Return to Home Page Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
