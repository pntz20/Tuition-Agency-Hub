import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { useCreateRequirement, useListParents } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  parentId: z.coerce.number().min(1, "Parent is required"),
  subject: z.string().min(1, "Subject is required"),
  grade: z.string().min(1, "Grade is required"),
  area: z.string().min(1, "Area is required"),
  daysPerWeek: z.coerce.number().min(1).max(7).optional(),
  duration: z.coerce.number().optional(),
  budget: z.coerce.number().optional(),
  teachingMode: z.enum(["home", "online", "both"]),
  gender: z.string().optional(),
  description: z.string().optional()
});

export default function NewRequirement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createRequirement = useCreateRequirement();
  const { data: parents } = useListParents({}, { query: { queryKey: ["parents"] } });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      parentId: 0,
      subject: "",
      grade: "",
      area: "",
      daysPerWeek: 5,
      duration: 1,
      budget: 0,
      teachingMode: "home",
      gender: "any",
      description: ""
    }
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    createRequirement.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Requirement Created", description: "Successfully posted new requirement." });
        setLocation("/requirements");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create requirement.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/requirements">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Post Requirement</h1>
          <p className="text-muted-foreground mt-1">Create a new tuition request.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField control={form.control} name="parentId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent</FormLabel>
                  <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a parent" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {parents?.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.phone})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="Maths, Science" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="grade" render={({ field }) => (
                  <FormItem><FormLabel>Grade/Class</FormLabel><FormControl><Input placeholder="Class 10" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="area" render={({ field }) => (
                  <FormItem><FormLabel>Location Area</FormLabel><FormControl><Input placeholder="Gomti Nagar" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="budget" render={({ field }) => (
                  <FormItem><FormLabel>Budget (/month)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

               <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="daysPerWeek" render={({ field }) => (
                  <FormItem><FormLabel>Days per week</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="duration" render={({ field }) => (
                  <FormItem><FormLabel>Duration (hours)</FormLabel><FormControl><Input type="number" step="0.5" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

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
                    <FormLabel>Tutor Gender Pref.</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="any">Any</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Requirements</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Specific needs, syllabus, goals..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={createRequirement.isPending}>
                  {createRequirement.isPending ? "Saving..." : "Post Requirement"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
