import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, BookOpen, Calendar, IndianRupee, TrendingUp } from "lucide-react";

export default function Dashboard() {
  // Try to use real data but gracefully fallback if not available
  const { data, isLoading, error } = useGetDashboardStats({ query: { enabled: true } });

  const stats = data || {
    totalLeads: 0,
    totalTutors: 0,
    activeRequirements: 0,
    demosScheduled: 0,
    paidTuitions: 0,
    totalRevenue: 0
  };

  const statCards = [
    { title: "Total Leads", value: stats.totalLeads, icon: UserPlus, color: "text-blue-500" },
    { title: "Total Tutors", value: stats.totalTutors, icon: Users, color: "text-indigo-500" },
    { title: "Active Req.", value: stats.activeRequirements, icon: BookOpen, color: "text-amber-500" },
    { title: "Demos Sched.", value: stats.demosScheduled, icon: Calendar, color: "text-emerald-500" },
    { title: "Paid Tuitions", value: stats.paidTuitions, icon: TrendingUp, color: "text-purple-500" },
    { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to the Tutor Marketplace operations hub.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? "..." : stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 min-h-[300px]">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center text-muted-foreground h-[200px]">
            {error ? "No data available." : "Charts will appear here."}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 min-h-[300px]">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center text-muted-foreground h-[200px]">
             {error ? "No data available." : "Pie chart will appear here."}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
