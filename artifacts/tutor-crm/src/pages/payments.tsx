import { useListPayments } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Payments() {
  const { data: payments, isLoading } = useListPayments({}, { query: { queryKey: ["payments"] } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Payments</h1>
        <p className="text-muted-foreground mt-1">Track registration and tuition fees.</p>
      </div>

      <div className="bg-card rounded-md border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parent</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Loading payments...</TableCell>
              </TableRow>
            ) : payments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No payments found.</TableCell>
              </TableRow>
            ) : (
              payments?.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.parentName || `Parent #${payment.parentId}`}</TableCell>
                  <TableCell>{payment.subject || `Req #${payment.requirementId}`}</TableCell>
                  <TableCell>₹{payment.amount}</TableCell>
                  <TableCell className="capitalize">{payment.type.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <Badge variant={payment.status === 'paid' ? 'default' : payment.status === 'overdue' ? 'destructive' : 'secondary'}>
                      {payment.status}
                    </Badge>
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
