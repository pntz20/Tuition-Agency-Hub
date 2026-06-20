import { useListParents } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";

export default function Parents() {
  const { data: parents, isLoading } = useListParents({}, { query: { queryKey: ["parents"] } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Parents</h1>
          <p className="text-muted-foreground mt-1">Directory of registered parents and leads.</p>
        </div>
        <Link href="/parents/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Parent
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-md border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Loading parents...</TableCell>
              </TableRow>
            ) : parents?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No parents found.</TableCell>
              </TableRow>
            ) : (
              parents?.map(parent => (
                <TableRow key={parent.id}>
                  <TableCell className="font-medium">{parent.name}</TableCell>
                  <TableCell>{parent.phone}</TableCell>
                  <TableCell>{parent.area}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{parent.leadStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground capitalize">{parent.leadSource.replace('_', ' ')}</span>
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
