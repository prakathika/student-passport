
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { GatepassCard } from "@/components/student/GatepassCard";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const GatepassDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, userData, loading } = useAuth();
  const [gatepass, setGatepass] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    if (!loading && !currentUser) {
      navigate("/login");
      return;
    }

    const fetchGatepass = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const docRef = doc(firestore, "gatepasses", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = {
            id: docSnap.id,
            ...docSnap.data()
          };
          
          // Verify user can access this gatepass
          if (userData?.role === "student" && data.studentId && data.studentId !== currentUser?.uid) {
            toast({
              title: "Access denied",
              description: "You do not have permission to view this gate pass.",
              variant: "destructive",
            });
            navigate("/dashboard");
            return;
          }
          
          setGatepass(data);
        } else {
          toast({
            title: "Not found",
            description: "The requested gate pass could not be found.",
            variant: "destructive",
          });
          navigate("/dashboard");
        }
      } catch (error: any) {
        console.error("Error fetching gatepass:", error);
        toast({
          title: "Error fetching gatepass",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && id) {
      fetchGatepass();
    }
  }, [id, currentUser, userData, loading, navigate, toast]);

  const handleBack = () => {
    if (userData?.role === "student") {
      navigate("/my-gatepasses");
    } else {
      if (gatepass?.status === "pending") {
        navigate("/pending-requests");
      } else if (gatepass?.status === "approved") {
        navigate("/approved-requests");
      } else {
        navigate("/dashboard");
      }
    }
  };

  if (loading || !userData) {
    return null;
  }

  return (
    <>
      <Header />
      <PageTransition>
        <div className="min-h-screen pt-20 pb-10">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="mb-6">
              <h1 className="text-2xl font-bold">Gate Pass Details</h1>
              <p className="text-muted-foreground">View the details of this gate pass</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : gatepass ? (
              <div className="max-w-3xl mx-auto">
                <GatepassCard 
                  gatepass={{
                    id: gatepass.id,
                    studentName: gatepass.studentName || "",
                    studentId: gatepass.studentId || "",
                    reason: gatepass.reason || "",
                    destination: gatepass.destination || "",
                    dateOfLeaving: gatepass.dateOfLeaving || gatepass.leaveDate || "",
                    timeOfLeaving: gatepass.timeOfLeaving || "",
                    expectedReturnDate: gatepass.expectedReturnDate || gatepass.returnDate || "",
                    expectedReturnTime: gatepass.expectedReturnTime || "",
                    status: gatepass.status || "pending",
                    approvedBy: gatepass.approvedBy || "",
                    approvedAt: gatepass.approvedAt || "",
                    rejectionReason: gatepass.rejectionReason || "",
                    createdAt: gatepass.createdAt,
                    ...gatepass
                  }}
                  detailed={true} 
                />
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p>Gate pass not found or you don't have permission to view it.</p>
                </CardContent>
                <CardFooter className="justify-center">
                  <Button onClick={() => navigate("/dashboard")}>
                    Return to Dashboard
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default GatepassDetail;
