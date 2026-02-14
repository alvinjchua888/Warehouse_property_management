import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/components/currency-provider";
import { Plus, Search, CreditCard, Pencil, Trash2 } from "lucide-react";
import type { Payment, InsertPayment, Lease } from "@shared/schema";

export default function Payments() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const emptyForm: InsertPayment = {
    leaseId: 0,
    amountDue: "0",
    amountPaid: "0",
    dueDate: "",
    paymentDate: "",
    status: "pending",
    paymentMethod: null,
    transactionReference: "",
    lateFee: "0",
    notes: "",
  };

  const [form, setForm] = useState<InsertPayment>(emptyForm);

  const { data: payments, isLoading } = useQuery<Payment[]>({ queryKey: ["/api/payments"] });
  const { data: leases } = useQuery<Lease[]>({ queryKey: ["/api/leases"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertPayment) => apiRequest("POST", "/api/payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Payment recorded successfully" });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertPayment> }) =>
      apiRequest("PATCH", `/api/payments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Payment updated successfully" });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Payment deleted successfully" });
      setDeleteId(null);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = payments?.filter((p) => {
    const matchSearch = `Lease #${p.leaseId}`.toLowerCase().includes(search.toLowerCase()) ||
      (p.transactionReference?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  function openCreate() {
    setEditingPayment(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(p: Payment) {
    setEditingPayment(p);
    setForm({
      leaseId: p.leaseId,
      amountDue: p.amountDue,
      amountPaid: p.amountPaid,
      dueDate: p.dueDate,
      paymentDate: p.paymentDate ?? "",
      status: p.status,
      paymentMethod: p.paymentMethod,
      transactionReference: p.transactionReference ?? "",
      lateFee: p.lateFee,
      notes: p.notes ?? "",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingPayment(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingPayment) {
      updateMutation.mutate({ id: editingPayment.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "paid": return "default";
      case "pending": return "secondary";
      case "overdue": return "destructive";
      case "partial": return "secondary";
      default: return "secondary";
    }
  };

  const totalCollected = payments?.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amountPaid), 0) ?? 0;
  const totalOverdue = payments?.filter((p) => p.status === "overdue").reduce((s, p) => s + Number(p.amountDue) - Number(p.amountPaid), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-payments-title">Payments</h1>
          <p className="text-muted-foreground mt-1">Track and manage rent payments</p>
        </div>
        <Button onClick={openCreate} data-testid="button-add-payment">
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Collected</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-total-collected">{formatCurrency(totalCollected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Overdue</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-total-overdue">{formatCurrency(totalOverdue)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by lease or reference..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-payments" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-payment-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-4 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No payments found</p>
            <p className="text-sm text-muted-foreground mt-1">Record your first payment</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lease</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} data-testid={`row-payment-${p.id}`}>
                    <TableCell className="font-medium">Lease #{p.leaseId}</TableCell>
                    <TableCell>{p.dueDate}</TableCell>
                    <TableCell>{formatCurrency(p.amountDue)}</TableCell>
                    <TableCell>{formatCurrency(p.amountPaid)}</TableCell>
                    <TableCell className="capitalize">{p.paymentMethod?.replace("_", " ") || "\u2014"}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor(p.status)} className="capitalize">{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(p)} data-testid={`button-edit-payment-${p.id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(p.id)} data-testid={`button-delete-payment-${p.id}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPayment ? "Edit Payment" : "Record Payment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Lease</Label>
              <Select value={String(form.leaseId)} onValueChange={(v) => setForm({ ...form, leaseId: parseInt(v) })}>
                <SelectTrigger data-testid="select-payment-lease"><SelectValue placeholder="Select lease" /></SelectTrigger>
                <SelectContent>
                  {leases?.filter((l) => l.status === "active").map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>Lease #{l.id} - {formatCurrency(l.rentalAmount)}/mo</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount Due</Label>
                <Input type="number" step="0.01" value={form.amountDue} onChange={(e) => setForm({ ...form, amountDue: e.target.value })} required data-testid="input-amount-due" />
              </div>
              <div className="space-y-2">
                <Label>Amount Paid</Label>
                <Input type="number" step="0.01" value={form.amountPaid!} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} data-testid="input-amount-paid" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required data-testid="input-due-date" />
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input type="date" value={form.paymentDate ?? ""} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} data-testid="input-payment-date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status!} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                  <SelectTrigger data-testid="select-payment-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={form.paymentMethod ?? "none"} onValueChange={(v) => setForm({ ...form, paymentMethod: v === "none" ? null : v as any })}>
                  <SelectTrigger data-testid="select-payment-method"><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transaction Reference</Label>
                <Input value={form.transactionReference ?? ""} onChange={(e) => setForm({ ...form, transactionReference: e.target.value })} data-testid="input-transaction-ref" />
              </div>
              <div className="space-y-2">
                <Label>Late Fee</Label>
                <Input type="number" step="0.01" value={form.lateFee!} onChange={(e) => setForm({ ...form, lateFee: e.target.value })} data-testid="input-late-fee" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} data-testid="input-payment-notes" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-payment">
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingPayment ? "Update" : "Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Payment</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} data-testid="button-confirm-delete-payment">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
