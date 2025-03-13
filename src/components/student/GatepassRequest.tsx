
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
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
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";
import { SlideUpTransition } from "@/components/layout/PageTransition";

const gatepassSchema = z.object({
  reason: z
    .string()
    .min(10, "Please provide a more detailed reason")
    .max(300, "Reason is too long"),
  destination: z.string().min(3, "Destination is required"),
  dateOfLeaving: z.date({
    required_error: "Date of leaving is required",
  }),
  timeOfLeaving: z.string().min(1, "Time of leaving is required"),
  expectedReturnDate: z.date({
    required_error: "Expected return date is required",
  }),
  expectedReturnTime: z.string().min(1, "Expected return time is required"),
  parentContactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits")
    .max(15, "Contact number must not exceed 15 digits"),
  additionalNotes: z.string().optional(),
});

type GatepassFormValues = z.infer<typeof gatepassSchema>;

export const GatepassRequest = () => {
  const { currentUser, userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<GatepassFormValues>({
    resolver: zodResolver(gatepassSchema),
    defaultValues: {
      reason: "",
      destination: "",
      parentContactNumber: "",
      additionalNotes: "",
      timeOfLeaving: "",
      expectedReturnTime: "",
    },
  });

  const onSubmit = async (data: GatepassFormValues) => {
    if (!currentUser) return;
    
    try {
      setIsSubmitting(true);
      
      // Format the dates for Firestore
      const gatepassData = {
        ...data,
        dateOfLeaving: format(data.dateOfLeaving, "yyyy-MM-dd"),
        expectedReturnDate: format(data.expectedReturnDate, "yyyy-MM-dd"),
        status: "pending",
        studentId: currentUser.uid,
        studentName: userData?.displayName || "",
        studentEmail: currentUser.email,
        createdAt: serverTimestamp(),
      };
      
      // Save to gatepasses collection
      const docRef = await addDoc(collection(firestore, "gatepasses"), gatepassData);
      
      toast({
        title: "Gatepass request submitted",
        description: "Your request has been submitted for approval.",
      });
      
      // Redirect to my gatepasses page
      navigate("/my-gatepasses");
      
    } catch (error: any) {
      console.error("Gatepass submission error:", error);
      toast({
        title: "Error submitting request",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser || userData?.role !== "student") {
    return null;
  }

  return (
    <SlideUpTransition>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Request Gatepass</h1>
          <p className="text-muted-foreground mt-2">
            Submit your gatepass request for approval
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Gatepass Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Reason for leaving</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide a detailed reason for your gatepass request"
                          className="resize-none min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Be specific about why you need to leave the campus
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="Where are you going?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentContactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Parent's phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfLeaving"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Leaving</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeOfLeaving"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time of Leaving</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input type="time" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedReturnDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected Return Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const leavingDate = form.getValues("dateOfLeaving");
                              return (
                                !leavingDate ||
                                date < leavingDate ||
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              );
                            }}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedReturnTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Return Time</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input type="time" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information..."
                          className="resize-none min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </SlideUpTransition>
  );
};
