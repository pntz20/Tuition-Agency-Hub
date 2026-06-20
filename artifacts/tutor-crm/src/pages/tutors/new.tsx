import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateTutor } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  qualifications: z.string().min(1, "Qualifications required"),
  experience: z.coerce.number().min(0).optional(),
  subjects: z.string().transform(v => v.split(",").map(s => s.trim()).filter(Boolean)),
  areas: z.string().transform(v => v.split(",").map(s => s.trim()).filter(Boolean)),
  grades: z.string().transform(v => v.split(",").map(s => s.trim()).filter(Boolean)),
  expectedFee: z.coerce.number().min(0).optional(),
  teachingMode: z.enum(["home", "online", "both"]),
  gender: z.string().optional()
});

export default function NewTutor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createTutor = useCreateTutor();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      qualifications: "",
      experience: 0,
      subjects: "" as any,
      areas: "" as any,
      grades: "" as any,
      expectedFee: 0,
      teachingMode: "home",
      gender: "unspecified"
    }
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    createTutor.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Tutor Registered", description: "Successfully added tutor to database." });
        setLocation("/tutors");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to register tutor.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tutors">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Register Tutor</h1>
          <p className="text-muted-foreground mt-1">Add a new tutor to the platform.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="qualifications" render={({ field }) => (
                  <FormItem><FormLabel>Qualifications</FormLabel><FormControl><Input placeholder="B.Tech, M.Sc, etc." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="experience" render={({ field }) => (
                  <FormItem><FormLabel>Experience (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="expectedFee" render={({ field }) => (
                  <FormItem><FormLabel>Expected Fee (/hr or /month)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="subjects" render={({ field }) => (
                <FormItem><FormLabel>Subjects (comma separated)</FormLabel><FormControl><Input placeholder="Maths, Physics, English" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="areas" render={({ field }) => (
                <FormItem><FormLabel>Preferred Areas (comma separated)</FormLabel><FormControl><Input placeholder="Gomti Nagar, Hazratganj" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="grades" render={({ field }) => (
                <FormItem><FormLabel>Grades/Levels (comma separated)</FormLabel><FormControl><Input placeholder="Class 10, Class 12, JEE" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="teachingMode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teaching Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="home">Home Tuition</SelectItem>
                        <SelectItem value="online">Online Tuition</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="unspecified">Unspecified</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={createTutor.isPending}>
                  {createTutor.isPending ? "Saving..." : "Register Tutor"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
