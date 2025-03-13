
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlideUpTransition } from "@/components/layout/PageTransition";
import { Loader2, Mail, Phone, Home, BookOpen, School, Building, DoorClosed, Contact, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export const StudentProfile = () => {
  const { currentUser, userData } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const docRef = doc(firestore, "students", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setStudentData(docSnap.data());
        } else {
          console.log("No student data found");
        }
      } catch (error: any) {
        console.error("Error fetching student data:", error);
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [currentUser, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!studentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
          <CardDescription>
            Your student profile could not be found. Please contact support.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <SlideUpTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your profile information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={studentData.photoURL || ""} alt={studentData.fullName} />
                  <AvatarFallback className="text-2xl">
                    {studentData.fullName?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{studentData.fullName}</CardTitle>
              <CardDescription className="text-primary font-medium">
                Student
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{userData?.email}</span>
              </div>
              <div className="flex items-center">
                <School className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{studentData.enrollmentNumber}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{studentData.emergencyContact}</span>
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Student Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Student Details</CardTitle>
              <CardDescription>Your complete student information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" /> Academic Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Course:</span>
                      <p>{studentData.course}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Semester:</span>
                      <p>{studentData.semester}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Enrollment Number:</span>
                      <p>{studentData.enrollmentNumber}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <Building className="h-4 w-4 mr-2" /> Hostel Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Hostel Block:</span>
                      <p>Block {studentData.hostelBlock}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Room Number:</span>
                      <p>{studentData.roomNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <Home className="h-4 w-4 mr-2" /> Permanent Address
                </h3>
                <p className="text-sm whitespace-pre-line">{studentData.permanentAddress}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <Contact className="h-4 w-4 mr-2" /> Emergency Contacts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Parent/Guardian Name:</span>
                    <p>{studentData.parentName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Parent/Guardian Contact:</span>
                    <p>{studentData.parentContact}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Emergency Contact:</span>
                    <p>{studentData.emergencyContact}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SlideUpTransition>
  );
};
