
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlideUpTransition } from "@/components/layout/PageTransition";
import { Mail, User, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const WardenProfile = () => {
  const { userData } = useAuth();

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
                  <AvatarImage src={userData?.photoURL || ""} alt={userData?.displayName || ""} />
                  <AvatarFallback className="text-2xl">
                    {userData?.displayName?.charAt(0) || "W"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{userData?.displayName}</CardTitle>
              <CardDescription className="text-primary font-medium capitalize">
                Warden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{userData?.email}</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Hostel Administrator</span>
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Warden Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Warden Dashboard</CardTitle>
              <CardDescription>Manage gate pass requests and view student information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Review Requests</CardTitle>
                    <CardDescription>
                      Review all pending gate pass requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => window.location.href = "/pending-requests"}
                    >
                      View Pending Requests
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Approved Passes</CardTitle>
                    <CardDescription>
                      View all approved gate passes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = "/approved-requests"}
                    >
                      View Approved Passes
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Full Name:</span>
                      <p>{userData?.displayName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Email Address:</span>
                      <p>{userData?.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Role:</span>
                      <p className="capitalize">{userData?.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </SlideUpTransition>
  );
};
