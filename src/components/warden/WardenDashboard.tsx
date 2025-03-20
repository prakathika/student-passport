
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  DocumentData,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SlideUpTransition } from "@/components/layout/PageTransition";
import { Clock, FileCheck, FilePenLine, FileX, Users } from "lucide-react";
import { WardenRequestList } from "@/components/warden/WardenRequestList";

export const WardenDashboard = () => {
  const { currentUser, userData } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<DocumentData[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        // Fetch pending requests
        const pendingRef = collection(firestore, "gatepasses");
        const pendingQuery = query(
          pendingRef,
          where("status", "==", "pending")
        );

        const pendingSnapshot = await getDocs(pendingQuery);
        const requests: DocumentData[] = [];

        pendingSnapshot.forEach((doc) => {
          requests.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setPendingRequests(requests.slice(0, 5));

        // Get stats for all requests
        const allRequestsRef = collection(firestore, "gatepasses");
        const allRequestsSnapshot = await getDocs(allRequestsRef);
        const allRequests: DocumentData[] = [];

        allRequestsSnapshot.forEach((doc) => {
          allRequests.push(doc.data());
        });

        // Get total number of students
        const studentsRef = collection(firestore, "students");
        const studentsSnapshot = await getDocs(studentsRef);

        setStats({
          totalRequests: allRequests.length,
          approved: allRequests.filter((req) => req.status === "approved")
            .length,
          pending: allRequests.filter((req) => req.status === "pending").length,
          rejected: allRequests.filter((req) => req.status === "rejected")
            .length,
          totalStudents: studentsSnapshot.size,
        });
      } catch (error: any) {
        console.error("Error fetching requests:", error);
        toast({
          title: "Error fetching requests",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, [currentUser, toast]);

  return (
    <SlideUpTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Warden Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {userData?.displayName}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <Link to="/pending-requests" className="flex-1">
            <Button size="lg" className="w-full">
              <FilePenLine className="mr-2 h-5 w-5" />
              Review Pending Requests
            </Button>
          </Link>
          <Link to="/approved-requests" className="flex-1">
            <Button size="lg" variant="outline" className="w-full">
              <FileCheck className="mr-2 h-5 w-5" />
              View Approved Passes
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-indigo-100 to-indigo-50">
            <CardHeader className="pb-2 bg-indigo-500 text-white">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-indigo-700">{stats.totalRequests}</div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-green-100 to-green-50">
            <CardHeader className="pb-2 bg-green-500 text-white">
              <CardTitle className="text-sm font-medium">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-green-700">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-amber-100 to-amber-50">
            <CardHeader className="pb-2 bg-amber-500 text-white">
              <CardTitle className="text-sm font-medium">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-amber-700">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-red-100 to-red-50">
            <CardHeader className="pb-2 bg-red-500 text-white">
              <CardTitle className="text-sm font-medium">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-red-700">{stats.rejected}</div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-blue-100 to-blue-50">
            <CardHeader className="pb-2 bg-blue-500 text-white">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-blue-700">{stats.totalStudents}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Pending Gatepass Requests
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Clock className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendingRequests.length > 0 ? (
            <div className="space-y-4">
              <WardenRequestList requests={pendingRequests} />
              <div className="text-center pt-4">
                <Link to="/pending-requests">
                  <Button variant="outline">View All Pending Requests</Button>
                </Link>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <CardDescription className="text-center">
                  There are no pending gatepass requests at the moment.
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SlideUpTransition>
  );
};
