import { useListLeads, useUpdateLeadStatus } from "@workspace/api-client-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Leads() {
  const { data: leads, isLoading } = useListLeads({}, { query: { queryKey: ["leads"] } });
  const updateStatus = useUpdateLeadStatus();

  const columns = [
    { id: "new", title: "New" },
    { id: "contacted", title: "Contacted" },
    { id: "qualified", title: "Qualified" },
    { id: "demo_scheduled", title: "Demo Sched." },
    { id: "demo_done", title: "Demo Done" },
    { id: "converted", title: "Converted" },
    { id: "lost", title: "Lost" },
  ];

  if (isLoading) return <div>Loading pipeline...</div>;

  const groupedLeads = (leads || []).reduce((acc: any, lead: any) => {
    if (!acc[lead.status]) acc[lead.status] = [];
    acc[lead.status].push(lead);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Lead Pipeline</h1>
          <p className="text-muted-foreground mt-1">Manage parent inquiries and follow-ups.</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
        {columns.map(col => (
          <div key={col.id} className="min-w-[300px] w-[300px] flex-shrink-0 bg-muted/50 rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-3 flex items-center justify-between text-muted-foreground uppercase tracking-wider">
              {col.title}
              <span className="bg-muted px-2 py-0.5 rounded-full text-xs">
                {groupedLeads[col.id]?.length || 0}
              </span>
            </h3>
            <div className="space-y-3">
              {(groupedLeads[col.id] || []).map((lead: any) => (
                <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm truncate">{lead.parentName}</span>
                      <Badge variant="outline" className="text-[10px]">{lead.source}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>{lead.parentPhone}</p>
                      <p>{lead.area}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
