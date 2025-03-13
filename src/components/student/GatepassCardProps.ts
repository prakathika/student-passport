
import { DocumentData } from "firebase/firestore";

export interface GatepassProps {
  gatepass: {
    id: string;
    studentName: string;
    studentId: string;
    reason: string;
    destination: string;
    dateOfLeaving: string;
    timeOfLeaving: string;
    expectedReturnDate: string;
    expectedReturnTime: string;
    status: "pending" | "approved" | "rejected";
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
    createdAt: any;
    [key: string]: any; // Allow additional properties
  };
  detailed?: boolean;
}
