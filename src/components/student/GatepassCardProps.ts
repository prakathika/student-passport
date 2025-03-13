
import { DocumentData } from "firebase/firestore";

export interface GatepassProps {
  gatepass: DocumentData;
  detailed?: boolean;
}
