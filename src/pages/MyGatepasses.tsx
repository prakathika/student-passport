import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { GatepassCard } from "@/components/student/GatepassCard";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";

const MyGatepasses = () => {
  const { currentUser, userData, loading } = useAuth();
  const [gatepasses, setGatepasses] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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

    const fetchGatepasses = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const passesRef = collection(firestore, "gatepasses");
        const q = query(
          passesRef,
          where("studentId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const passes: DocumentData[] = [];

        querySnapshot.forEach((doc) => {
          passes.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setGatepasses(passes);
      } catch (error: any) {
        console.error("Error fetching gatepasses:", error);
        toast({
          title: "Error fetching gatepasses",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && userData?.role === "student") {
      fetchGatepasses();
    }
  }, [currentUser, userData, loading, navigate, toast]);

  if (loading || !userData || userData.role !== "student") {
    return null;
  }

  return (
    <>
      <Header />
      <PageTransition>
        <div className="min-h-screen pt-20 pb-10">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">My Gate Passes</h1>
              <p className="text-muted-foreground">
                View all of your gate pass requests
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Clock className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {gatepasses.map((pass) => (
                  <GatepassCard 
                    key={pass.id} 
                    gatepass={{
                      id: pass.id,
                      studentName: pass.studentName || "",
                      studentId: pass.studentId || "",
                      reason: pass.reason || "",
                      destination: pass.destination || "",
                      dateOfLeaving: pass.dateOfLeaving || pass.leaveDate || "",
                      timeOfLeaving: pass.timeOfLeaving || "",
                      expectedReturnDate: pass.expectedReturnDate || pass.returnDate || "",
                      expectedReturnTime: pass.expectedReturnTime || "",
                      status: pass.status || "pending",
                      approvedBy: pass.approvedBy || "",
                      approvedAt: pass.approvedAt || "",
                      rejectionReason: pass.rejectionReason || "",
                      createdAt: pass.createdAt,
                      ...pass
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default MyGatepasses;
