import { useListTutors } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";

export default function Tutors() {
  const { data: tutors, isLoading } = useListTutors({}, { query: { queryKey: ["tutors"] } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tutors</h1>
          <p className="text-muted-foreground mt-1">Directory of registered tutors.</p>
        </div>
        <Link href="/tutors/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Tutor
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-md border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Areas</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Loading tutors...</TableCell>
              </TableRow>
            ) : tutors?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No tutors found.</TableCell>
              </TableRow>
            ) : (
              tutors?.map(tutor => (
                <TableRow key={tutor.id}>
                  <TableCell className="font-medium">{tutor.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {tutor.subjects.slice(0,2).map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                      {tutor.subjects.length > 2 && <span className="text-xs text-muted-foreground">+{tutor.subjects.length - 2}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {tutor.areas.join(", ")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize">{tutor.teachingMode}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tutor.status === 'active' ? 'default' : 'secondary'}>{tutor.status}</Badge>
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
