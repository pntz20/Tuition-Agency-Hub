import { useListDemos } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Demos() {
  const { data: demos, isLoading } = useListDemos({}, { query: { queryKey: ["demos"] } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Demos</h1>
        <p className="text-muted-foreground mt-1">Scheduled trial classes.</p>
      </div>

      <div className="bg-card rounded-md border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Loading demos...</TableCell>
              </TableRow>
            ) : demos?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No demos found.</TableCell>
              </TableRow>
            ) : (
              demos?.map(demo => (
                <TableRow key={demo.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(demo.scheduledAt), "MMM d, h:mm a")}
                  </TableCell>
                  <TableCell>{demo.tutorName || `Tutor #${demo.tutorId}`}</TableCell>
                  <TableCell>{demo.parentName || `Parent #${demo.parentId}`}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {demo.subject}
                      <span className="block text-xs text-muted-foreground">{demo.area}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={demo.status === 'scheduled' ? 'default' : 'secondary'}>{demo.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
