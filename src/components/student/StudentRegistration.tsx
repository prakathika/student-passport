
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is already registered
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!currentUser) return;
    
    try {
      setUploading(true);
      
      // Upload profile picture if selected
      let photoURL = userData?.photoURL || null;
      
      if (profileImage) {
        const imageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
        await uploadBytes(imageRef, profileImage);
        photoURL = await getDownloadURL(imageRef);
      }
      
      // Create student profile
      const studentData = {
        ...data,
        photoURL,
        isProfileComplete: true,
        userId: currentUser.uid,
        email: currentUser.email,
        role: "student",
        createdAt: new Date().toISOString(),
      };
      
      // Save to students collection
      await setDoc(doc(firestore, "students", currentUser.uid), studentData);
      
      // Update user profile
      await updateUserData({
        isProfileComplete: true,
        photoURL,
      });
      
      toast({
        title: "Profile complete!",
        description: "Your student profile has been created successfully.",
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error("Profile creation error:", error);
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!currentUser || userData?.role !== "student") {
    return null;
  }

  return (
    <SlideUpTransition>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Please provide your information to complete the registration.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20 mb-4">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : userData?.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
              <label htmlFor="profileImage" className="cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                  Upload profile picture
                </div>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
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
                        <SelectItem value="1">1st Semester</SelectItem>
                        <SelectItem value="2">2nd Semester</SelectItem>
                        <SelectItem value="3">3rd Semester</SelectItem>
                        <SelectItem value="4">4th Semester</SelectItem>
                        <SelectItem value="5">5th Semester</SelectItem>
                        <SelectItem value="6">6th Semester</SelectItem>
                        <SelectItem value="7">7th Semester</SelectItem>
                        <SelectItem value="8">8th Semester</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hostel Information */}
              <FormField
                control={form.control}
                name="hostelBlock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hostel Block</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your hostel block" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">Block A</SelectItem>
                        <SelectItem value="B">Block B</SelectItem>
                        <SelectItem value="C">Block C</SelectItem>
                        <SelectItem value="D">Block D</SelectItem>
                        <SelectItem value="E">Block E</SelectItem>
                        <SelectItem value="F">Block F</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., A-101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Parent/Guardian Information */}
              <FormField
                control={form.control}
                name="parentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent/Guardian Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Parent/Guardian full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent/Guardian Contact</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Parent/Guardian phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Emergency contact number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Permanent Address */}
            <FormField
              control={form.control}
              name="permanentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permanent Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Your permanent residential address"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={uploading}
            >
              {uploading ? "Saving Profile..." : "Complete Registration"}
            </Button>
          </form>
        </Form>
      </div>
    </SlideUpTransition>
  );
};
