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
import { WardenRequestList } from "@/components/warden/WardenRequestList";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";

const PendingRequests = () => {
  const { currentUser, userData, loading } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/login");
      return;
    }

    if (!loading && userData && userData.role !== "warden") {
      navigate("/dashboard");
      return;
    }

    const fetchPendingRequests = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const requestsRef = collection(firestore, "gatepasses");
        const q = query(requestsRef, where("status", "==", "pending"));

        const querySnapshot = await getDocs(q);
        const requests: DocumentData[] = [];

        querySnapshot.forEach((doc) => {
          requests.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setPendingRequests(requests);
      } catch (error: any) {
        console.error("Error fetching requests:", error);
        toast({
          title: "Error fetching requests",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && userData?.role === "warden") {
      fetchPendingRequests();
    }
  }, [currentUser, userData, loading, navigate, toast]);

  if (loading || !userData || userData.role !== "warden") {
    return null;
  }

  return (
    <>
      <Header />
      <PageTransition>
        <div className="min-h-screen pt-20 pb-10">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Pending Gate Pass Requests</h1>
              <p className="text-muted-foreground">
                Review and approve/reject student gate pass requests
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Clock className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <WardenRequestList requests={pendingRequests} />
            )}
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default PendingRequests;
