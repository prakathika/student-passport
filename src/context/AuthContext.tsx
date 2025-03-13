
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "student" | "warden";
  photoURL: string | null;
  isProfileComplete?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  register: (email: string, password: string, role: "student" | "warden", name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const docRef = doc(firestore, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            console.log("No user data found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, role: "student" | "warden", name: string) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, {
        displayName: name
      });
      
      // Create user document in Firestore
      const userData: UserData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: name,
        role: role,
        photoURL: result.user.photoURL,
        isProfileComplete: false
      };
      
      await setDoc(doc(firestore, "users", result.user.uid), userData);
      
      setUserData(userData);
      
      toast({
        title: "Account created",
        description: "Your account has been successfully created",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome back",
        description: "You have successfully logged in",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Reset email sent",
        description: "Check your email for the password reset link",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Failed to send reset email",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(firestore, "users", currentUser.uid);
      await setDoc(userRef, data, { merge: true });
      
      // Update local state
      setUserData(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: "Profile updated",
        description: "Your information has been updated successfully",
      });
    } catch (error: any) {
      console.error("Update user data error:", error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    register,
    login,
    logout,
    resetPassword,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
