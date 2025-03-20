import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { firestore } from "@/lib/firebase";
import { doc, updateDoc, DocumentData } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { CalendarClock, Check, X, Eye } from "lucide-react";

interface WardenRequestListProps {
  requests: DocumentData[];
}

export const WardenRequestList = ({ requests }: WardenRequestListProps) => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleApprove = async (requestId: string) => {
    try {
      setIsUpdating(true);
      const requestRef = doc(firestore, "gatepasses", requestId);

      await updateDoc(requestRef, {
        status: "approved",
        approvedAt: new Date().toISOString(),
      });

      toast({
        title: "Request approved",
        description: "The gatepass request has been approved successfully.",
      });

      // Update the local state or refetch data
      navigate("/"); // Refresh the page to show updated data
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast({
        title: "Error approving request",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setOpenDialog(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      const requestRef = doc(firestore, "gatepasses", requestId);

      await updateDoc(requestRef, {
        status: "rejected",
        rejectionReason: rejectReason,
        rejectedAt: new Date().toISOString(),
      });

      toast({
        title: "Request rejected",
        description: "The gatepass request has been rejected.",
      });

      // Update the local state or refetch data
      navigate("/"); // Refresh the page to show updated data
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error rejecting request",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setOpenDialog(null);
      setRejectReason("");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "PPP p");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <CalendarClock className="h-12 w-12 text-muted-foreground mb-4" />
            <CardDescription className="text-center">
              No gatepass requests found.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        requests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{request.studentName}</CardTitle>
                  <CardDescription>
                    {request.enrollmentNumber} | {request.hostelBlock}-
                    {request.roomNumber}
                  </CardDescription>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Leave Date</p>
                  <p className="font-medium">{formatDate(request.leaveDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Return Date</p>
                  <p className="font-medium">
                    {formatDate(request.returnDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium">{request.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Parent Contact
                  </p>
                  <p className="font-medium">{request.parentContact}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Reason for Leave
                </p>
                <p className="text-sm mt-1">{request.reason}</p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Requested on</p>
                <p className="text-sm">{formatTimestamp(request.createdAt)}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
              {request.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 border-red-500 hover:bg-red-500/10"
                    onClick={() => setOpenDialog(`reject-${request.id}`)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => handleApprove(request.id)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/gatepass/${request.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </CardFooter>

            {/* Reject Dialog */}
            <Dialog
              open={openDialog === `reject-${request.id}`}
              onOpenChange={(open) => !open && setOpenDialog(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Gate Pass Request</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this request. This
                    will be visible to the student.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="reason">Reason for rejection</Label>
                  <Input
                    id="reason"
                    placeholder="Enter reason for rejection"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpenDialog(null);
                      setRejectReason("");
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(request.id)}
                    disabled={isUpdating || !rejectReason.trim()}
                  >
                    {isUpdating ? "Rejecting..." : "Reject Request"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>
        ))
      )}
    </div>
  );
};
