import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlideUpTransition } from "@/components/layout/PageTransition";

const profileSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  enrollmentNumber: z.string().min(3, "Enrollment number is required"),
  course: z.string().min(1, "Course is required"),
  semester: z.string().min(1, "Semester is required"),
  hostelBlock: z.string().min(1, "Hostel block is required"),
  roomNumber: z.string().min(1, "Room number is required"),
  permanentAddress: z.string().min(10, "Address is too short"),
  parentName: z.string().min(3, "Parent name must be at least 3 characters"),
  parentContact: z
    .string()
    .min(10, "Contact number must be at least 10 digits")
    .max(15, "Contact number must not exceed 15 digits"),
  emergencyContact: z
    .string()
    .min(10, "Emergency contact must be at least 10 digits")
    .max(15, "Emergency contact must not exceed 15 digits"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const StudentRegistration = () => {
  const { currentUser, userData, updateUserData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if profile is already complete
  useEffect(() => {
    if (userData?.isProfileComplete) {
      navigate("/dashboard");
    }
  }, [userData, navigate]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: userData?.displayName || "",
      enrollmentNumber: "",
      course: "",
      semester: "",
      hostelBlock: "",
      roomNumber: "",
      permanentAddress: "",
      parentName: "",
      parentContact: "",
      emergencyContact: "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!currentUser) return;

    try {
      // Create student profile data
      const studentData = {
        ...data,
        isProfileComplete: true,
        userId: currentUser.uid,
        email: currentUser.email,
        role: "student",
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore
      await setDoc(doc(firestore, "students", currentUser.uid), studentData);

      // Update user data in context
      await updateUserData({
        isProfileComplete: true,
      });

      toast({
        title: "Profile complete!",
        description: "Your student profile has been created successfully.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Profile creation error:", error);
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!currentUser || userData?.role !== "student") {
    return null;
  }

  return (
    <SlideUpTransition>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Please provide your information to complete the registration.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Enrollment Number */}
              <FormField
                control={form.control}
                name="enrollmentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment Number</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., BCS2021001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Course */}
              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="B.Tech">B.Tech</SelectItem>
                        <SelectItem value="M.Tech">M.Tech</SelectItem>
                        <SelectItem value="BBA">BBA</SelectItem>
                        <SelectItem value="MBA">MBA</SelectItem>
                        <SelectItem value="BCA">BCA</SelectItem>
                        <SelectItem value="MCA">MCA</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Semester */}
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[...Array(8).keys()].map((i) => (
                          <SelectItem key={i} value={`${i + 1}`}>
                            {i + 1} Semester
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hostel Block */}
              <FormField
                control={form.control}
                name="hostelBlock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hostel Block</FormLabel>
                    <FormControl>
                      <Input placeholder="Hostel block" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Room Number */}
              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Room number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </div>
    </SlideUpTransition>
  );
};
