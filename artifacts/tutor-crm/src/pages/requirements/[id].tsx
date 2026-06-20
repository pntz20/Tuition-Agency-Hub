import { useGetRequirement, useListApplications, useUpdateApplication, useCreateDemo } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, CalendarDays, IndianRupee, User, BookOpen, Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function RequirementDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { toast } = useToast();

  const { data: req, isLoading: reqLoading } = useGetRequirement(id, { query: { queryKey: ["requirement", id] } });
  const { data: applications, isLoading: appLoading, refetch } = useListApplications(id, { query: { queryKey: ["applications", id] } });
  
  const updateApp = useUpdateApplication();
  const createDemo = useCreateDemo();

  const handleStatusChange = (appId: number, status: any) => {
    updateApp.mutate({ id: appId, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Updated", description: `Application marked as ${status}` });
        refetch();
      }
    });
  };

  const handleScheduleDemo = (tutorId: number) => {
    createDemo.mutate({
      data: {
        requirementId: id,
        tutorId,
        scheduledAt: new Date(Date.now() + 86400000).toISOString() // Tomorrow mock
      }
    }, {
      onSuccess: () => {
        toast({ title: "Demo Scheduled", description: "Demo scheduled for tomorrow." });
      }
    });
  };

  if (reqLoading) return <div>Loading...</div>;
  if (!req) return <div>Requirement not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{req.subject} for {req.grade}</h1>
          <p className="text-muted-foreground mt-1">Parent: {req.parentName}</p>
        </div>
        <Badge className="text-sm px-3 py-1 capitalize" variant={req.status === 'open' ? 'default' : 'secondary'}>
          {req.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Requirement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Location</p>
                <p className="text-muted-foreground">{req.area}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Budget</p>
                <p className="text-muted-foreground">₹{req.budget || 'Negotiable'} / month</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Schedule</p>
                <p className="text-muted-foreground">{req.daysPerWeek} days/week, {req.duration} hrs/day</p>
              </div>
            </div>

             <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Teaching Mode</p>
                <p className="text-muted-foreground capitalize">{req.teachingMode}</p>
              </div>
            </div>
            
            {req.description && (
              <div className="pt-4 border-t border-border mt-4">
                <p className="font-medium text-foreground text-sm mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{req.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Tutor Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {appLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading applications...</div>
            ) : applications?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                No tutors have applied yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tutor Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications?.map(app => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.tutorName}</TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'selected' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {app.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleStatusChange(app.id, 'shortlisted')}>
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleStatusChange(app.id, 'rejected')}>
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {(app.status === 'shortlisted' || app.status === 'selected') && (
                            <Button size="sm" onClick={() => handleScheduleDemo(app.tutorId)}>
                              Schedule Demo
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
