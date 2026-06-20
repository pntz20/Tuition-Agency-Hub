import { useListRequirements } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, MapPin, IndianRupee, Clock, BookOpen } from "lucide-react";

export default function Requirements() {
  const { data: requirements, isLoading } = useListRequirements({}, { query: { queryKey: ["requirements"] } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Requirements</h1>
          <p className="text-muted-foreground mt-1">Open tuition requirements needing tutors.</p>
        </div>
        <Link href="/requirements/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Requirement
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">Loading requirements...</div>
        ) : requirements?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">No open requirements found.</div>
        ) : (
          requirements?.map(req => (
            <Card key={req.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold">{req.subject}</CardTitle>
                    <p className="text-sm font-medium text-primary mt-1">{req.grade}</p>
                  </div>
                  <Badge variant={req.status === 'open' ? 'default' : 'secondary'}>{req.status.replace('_', ' ')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 pb-3 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" /> {req.area}
                </div>
                {req.budget && (
                  <div className="flex items-center text-muted-foreground">
                    <IndianRupee className="w-4 h-4 mr-2" /> ₹{req.budget}/month
                  </div>
                )}
                {req.teachingMode && (
                  <div className="flex items-center text-muted-foreground capitalize">
                    <BookOpen className="w-4 h-4 mr-2" /> {req.teachingMode}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-3 border-t">
                <Link href={`/requirements/${req.id}`} className="w-full">
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
