import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GatepassCard } from "@/components/student/GatepassCard";
import { SlideUpTransition } from "@/components/layout/PageTransition";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarClock,
  Clock,
  FilePenLine,
  FileCheck,
  FileX,
} from "lucide-react";

export const StudentDashboard = () => {
  const { currentUser, userData } = useAuth();
  const [recentPasses, setRecentPasses] = useState<DocumentData[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecentPasses = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const passesRef = collection(firestore, "gatepasses");
        const q = query(passesRef, where("studentId", "==", currentUser.uid));

        const querySnapshot = await getDocs(q);
        const passes: DocumentData[] = [];

        querySnapshot.forEach((doc) => {
          passes.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setRecentPasses(passes.slice(0, 5));

        // Calculate stats
        const allPasses = passes;
        setStats({
          totalRequests: allPasses.length,
          approved: allPasses.filter((pass) => pass.status === "approved")
            .length,
          pending: allPasses.filter((pass) => pass.status === "pending").length,
          rejected: allPasses.filter((pass) => pass.status === "rejected")
            .length,
        });
      } catch (error: any) {
        console.error("Error fetching passes:", error);
        toast({
          title: "Error fetching passes",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPasses();
  }, [currentUser, toast]);

  return (
    <SlideUpTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {userData?.displayName}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <Link to="/request-gatepass" className="flex-1">
            <Button size="lg" className="w-full">
              <FilePenLine className="mr-2 h-5 w-5" />
              Request New Gate Pass
            </Button>
          </Link>
          <Link to="/my-gatepasses" className="flex-1">
            <Button size="lg" variant="outline" className="w-full">
              <FileCheck className="mr-2 h-5 w-5" />
              View All Gate Passes
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-500">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-500">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Passes */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Gate Passes</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Clock className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentPasses.length > 0 ? (
            <div className="space-y-4">
              {recentPasses.map((pass) => (
                <GatepassCard key={pass.id} gatepass={pass} />
              ))}
              <div className="text-center pt-4">
                <Link to="/my-gatepasses">
                  <Button variant="outline">View All Gate Passes</Button>
                </Link>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CalendarClock className="h-12 w-12 text-muted-foreground mb-4" />
                <CardDescription className="text-center">
                  You haven't requested any gate passes yet.
                  <br />
                  Create your first request to get started.
                </CardDescription>
                <CardFooter className="pt-6">
                  <Link to="/request-gatepass">
                    <Button>Request New Gate Pass</Button>
                  </Link>
                </CardFooter>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SlideUpTransition>
  );
};
