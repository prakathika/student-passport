
import { useState } from "react";
import { motion } from "framer-motion";
import { format, isValid, parseISO } from "date-fns";
import { Check, X, Clock, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { GatepassProps } from "./GatepassCardProps";

export const GatepassCard = ({ gatepass, detailed }: GatepassProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    id,
    studentName,
    studentId,
    reason,
    destination,
    dateOfLeaving,
    timeOfLeaving,
    expectedReturnDate,
    expectedReturnTime,
    status,
    approvedBy,
    approvedAt,
    rejectionReason,
    createdAt,
  } = gatepass;

  const formatDate = (dateString: any) => {
    if (!dateString) return "N/A";
    
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      if (!isValid(date)) return "N/A";
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      console.error("Date formatting error:", error, dateString);
      return "N/A";
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A";

    try {
      // Handle different timestamp formats
      let date;
      if (timestamp.seconds) {
        // Firestore timestamp
        date = new Date(timestamp.seconds * 1000);
      } else if (typeof timestamp === 'string') {
        // ISO string
        date = parseISO(timestamp);
      } else {
        // Fallback to direct date
        date = new Date(timestamp);
      }

      if (!isValid(date)) return "N/A";
      return format(date, "PPP");
    } catch (error) {
      console.error("Date formatting error:", error, timestamp);
      return "N/A";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "approved":
        return <Check className="h-4 w-4" />;
      case "rejected":
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const generatePDF = async () => {
    try {
      setIsDownloading(true);
      const gatepassElement = document.getElementById("gatepass-print");
      
      if (!gatepassElement) {
        console.error("Gatepass element not found");
        return;
      }
      
      const canvas = await html2canvas(gatepassElement, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Gatepass-${id}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="card-hover overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{destination || "No destination"}</CardTitle>
              <CardDescription>
                {formatTimestamp(createdAt)}
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={cn("capitalize flex items-center gap-1 px-2.5 py-1", getStatusColor())}
            >
              {getStatusIcon()}
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-x-4 text-sm">
              <div className="text-muted-foreground">Leaving:</div>
              <div className="font-medium">
                {formatDate(dateOfLeaving)} at {timeOfLeaving || "N/A"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 text-sm">
              <div className="text-muted-foreground">Return:</div>
              <div className="font-medium">
                {formatDate(expectedReturnDate)} at {expectedReturnTime || "N/A"}
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">Reason:</p>
              <p className="text-sm">{truncateText(reason || "No reason provided", 100)}</p>
            </div>
            {status === "rejected" && rejectionReason && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">Rejection Reason:</p>
                <p className="text-sm text-red-600">{truncateText(rejectionReason, 100)}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setIsOpen(true)}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            View Details
          </Button>
          
          {status === "approved" && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={generatePDF}
              disabled={isDownloading}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              {isDownloading ? "Generating..." : "Download"}
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Gatepass Details</DialogTitle>
            <DialogDescription>
              ID: {id}
            </DialogDescription>
          </DialogHeader>

          <div id="gatepass-print" className="bg-white rounded-md p-6 space-y-6">
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold">Student Gatepass</h2>
              <p className="text-muted-foreground">
                {format(new Date(), "MMMM dd, yyyy")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="font-semibold">{studentName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="font-semibold">{studentId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize flex items-center gap-1 px-2.5 py-0.5",
                      getStatusColor()
                    )}
                  >
                    {getStatusIcon()}
                    {status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {status === "approved" ? "Approved On" : "Requested On"}
                </p>
                <p className="font-semibold">
                  {status === "approved" && approvedAt
                    ? format(new Date(approvedAt), "PPP")
                    : format(new Date(createdAt?.toDate?.() || createdAt), "PPP")}
                </p>
              </div>
            </div>

            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-semibold">{destination}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reason for Leave</p>
                <p>{reason}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
              <div>
                <p className="text-sm text-muted-foreground">Date of Leaving</p>
                <p className="font-semibold">
                  {format(new Date(dateOfLeaving), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time of Leaving</p>
                <p className="font-semibold">{timeOfLeaving}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Return Date</p>
                <p className="font-semibold">
                  {format(new Date(expectedReturnDate), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Return Time</p>
                <p className="font-semibold">{expectedReturnTime}</p>
              </div>
            </div>

            {status === "approved" && (
              <div className="py-4">
                <p className="text-sm text-muted-foreground">Approved By</p>
                <p className="font-semibold">{approvedBy || "Warden"}</p>
              </div>
            )}

            {status === "rejected" && rejectionReason && (
              <div className="py-4">
                <p className="text-sm text-muted-foreground">Reason for Rejection</p>
                <p>{rejectionReason}</p>
              </div>
            )}

            {status === "approved" && (
              <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Student Signature</p>
                  <div className="h-16 border-b border-dashed mt-8"></div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Warden Signature</p>
                  <div className="h-16 border-b border-dashed mt-8"></div>
                </div>
              </div>
            )}

            <div className="text-xs text-center text-muted-foreground pt-4">
              This gatepass is only valid when presented with a student ID card.
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            {status === "approved" && (
              <Button onClick={generatePDF} disabled={isDownloading}>
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Generating..." : "Download Gatepass"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
