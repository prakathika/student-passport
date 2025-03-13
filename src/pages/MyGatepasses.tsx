
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, DocumentData } from "firebase/firestore";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { GatepassCard } from "@/components/student/GatepassCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, Clock, FilterX, Check, X, CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MyGatepasses = () => {
  const { currentUser, userData, loading } = useAuth();
  const [gatepasses, setGatepasses] = useState<DocumentData[]>([]);
  const [filteredPasses, setFilteredPasses] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
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

    // Check if student profile is complete
    if (!loading && userData && userData.role === "student" && !userData.isProfileComplete) {
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
        setFilteredPasses(passes);
      } catch (error: any) {
        console.error("Error fetching passes:", error);
        toast({
          title: "Error fetching passes",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchGatepasses();
    }
  }, [currentUser, userData, loading, navigate, toast]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === "all") {
      setFilteredPasses(gatepasses);
    } else {
      setFilteredPasses(gatepasses.filter(pass => pass.status === filter));
    }
  };

  if (loading || !userData || !userData.isProfileComplete) {
    return null;
  }

  return (
    <>
      <Header />
      <PageTransition>
        <div className="min-h-screen pt-20 pb-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">My Gate Passes</h1>
                <p className="text-muted-foreground">View all your gate pass requests</p>
              </div>
              <Button
                onClick={() => navigate("/request-gatepass")}
                className="mt-4 md:mt-0"
              >
                New Gate Pass Request
              </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all" onClick={() => handleFilterChange("all")}>
                  All
                </TabsTrigger>
                <TabsTrigger value="pending" onClick={() => handleFilterChange("pending")}>
                  <CircleAlert className="mr-1 h-4 w-4 text-amber-500" />
                  Pending
                </TabsTrigger>
                <TabsTrigger value="approved" onClick={() => handleFilterChange("approved")}>
                  <Check className="mr-1 h-4 w-4 text-green-500" />
                  Approved
                </TabsTrigger>
                <TabsTrigger value="rejected" onClick={() => handleFilterChange("rejected")}>
                  <X className="mr-1 h-4 w-4 text-red-500" />
                  Rejected
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {renderGatepassList()}
              </TabsContent>
              <TabsContent value="pending" className="mt-0">
                {renderGatepassList()}
              </TabsContent>
              <TabsContent value="approved" className="mt-0">
                {renderGatepassList()}
              </TabsContent>
              <TabsContent value="rejected" className="mt-0">
                {renderGatepassList()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageTransition>
    </>
  );

  function renderGatepassList() {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <Clock className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredPasses.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarClock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No gate passes found</h3>
          <p className="text-muted-foreground mb-6">
            {activeFilter === "all"
              ? "You haven't requested any gate passes yet."
              : `You don't have any ${activeFilter} gate passes.`}
          </p>
          {activeFilter !== "all" && (
            <Button variant="outline" onClick={() => handleFilterChange("all")}>
              <FilterX className="mr-2 h-4 w-4" />
              Clear Filter
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredPasses.map((gatepass) => (
          <GatepassCard key={gatepass.id} gatepass={gatepass} />
        ))}
      </div>
    );
  }
};

export default MyGatepasses;
