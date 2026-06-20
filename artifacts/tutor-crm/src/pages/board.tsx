import { useListRequirements } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, IndianRupee, BookOpen, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Board() {
  const { data: requirements, isLoading } = useListRequirements({ status: "open" }, { query: { queryKey: ["requirements", "open"] } });

  return (
    <div className="min-h-screen bg-gray-50/50 pt-12 pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-3xl">T</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Tutor Marketplace Board
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect home or online tuition opportunities in Lucknow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">Loading open requirements...</div>
          ) : requirements?.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-muted-foreground font-medium">No open requirements right now.</p>
              <p className="text-sm text-muted-foreground mt-1">Check back later.</p>
            </div>
          ) : (
            requirements?.map(req => (
              <Card key={req.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold">{req.subject}</CardTitle>
                      <p className="text-sm font-semibold text-primary mt-1">{req.grade}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 pt-4 text-sm">
                  <div className="grid grid-cols-2 gap-y-3">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-foreground/50" /> {req.area}
                    </div>
                    {req.budget && (
                      <div className="flex items-center text-muted-foreground">
                        <IndianRupee className="w-4 h-4 mr-2 text-foreground/50" /> ₹{req.budget}/mo
                      </div>
                    )}
                    {req.teachingMode && (
                      <div className="flex items-center text-muted-foreground capitalize">
                        <BookOpen className="w-4 h-4 mr-2 text-foreground/50" /> {req.teachingMode}
                      </div>
                    )}
                    <div className="flex items-center text-muted-foreground capitalize">
                      <Clock className="w-4 h-4 mr-2 text-foreground/50" /> {req.daysPerWeek} days/wk
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-6">
                  <Link href="/tutors/new" className="w-full">
                    <Button className="w-full font-medium" variant="default">Apply as Tutor</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
