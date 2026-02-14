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
import { Plus, Search, FileText, Pencil, Trash2 } from "lucide-react";
import type { Lease, InsertLease, Warehouse as WarehouseType, Tenant } from "@shared/schema";

export default function Leases() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLease, setEditingLease] = useState<Lease | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const emptyForm: InsertLease = {
    warehouseId: 0,
    tenantId: 0,
    startDate: "",
    endDate: "",
    rentalAmount: "0",
    paymentFrequency: "monthly",
    securityDeposit: "0",
    lateFeePercentage: "5",
    gracePeriodDays: 5,
    status: "active",
    termsAndConditions: "",
    notes: "",
  };

  const [form, setForm] = useState<InsertLease>(emptyForm);

  const { data: leases, isLoading } = useQuery<Lease[]>({ queryKey: ["/api/leases"] });
  const { data: warehouses } = useQuery<WarehouseType[]>({ queryKey: ["/api/warehouses"] });
  const { data: tenants } = useQuery<Tenant[]>({ queryKey: ["/api/tenants"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertLease) => apiRequest("POST", "/api/leases", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/warehouses"] });
      toast({ title: "Lease created successfully" });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertLease> }) =>
      apiRequest("PATCH", `/api/leases/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/warehouses"] });
      toast({ title: "Lease updated successfully" });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/leases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/warehouses"] });
      toast({ title: "Lease deleted successfully" });
      setDeleteId(null);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const getWarehouseLabel = (id: number) => warehouses?.find((w) => w.id === id)?.unitNumber ?? `#${id}`;
  const getTenantLabel = (id: number) => tenants?.find((t) => t.id === id)?.fullName ?? `#${id}`;

  const filtered = leases?.filter((l) => {
    const matchSearch =
      getWarehouseLabel(l.warehouseId).toLowerCase().includes(search.toLowerCase()) ||
      getTenantLabel(l.tenantId).toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  function openCreate() {
    setEditingLease(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(l: Lease) {
    setEditingLease(l);
    setForm({
      warehouseId: l.warehouseId,
      tenantId: l.tenantId,
      startDate: l.startDate,
      endDate: l.endDate,
      rentalAmount: l.rentalAmount,
      paymentFrequency: l.paymentFrequency,
      securityDeposit: l.securityDeposit,
      lateFeePercentage: l.lateFeePercentage,
      gracePeriodDays: l.gracePeriodDays,
      status: l.status,
      termsAndConditions: l.termsAndConditions ?? "",
      notes: l.notes ?? "",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingLease(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingLease) {
      updateMutation.mutate({ id: editingLease.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "expired": return "secondary";
      case "terminated": return "destructive";
      default: return "secondary";
    }
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 60 && daysLeft > 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-leases-title">Leases</h1>
          <p className="text-muted-foreground mt-1">Manage lease agreements</p>
        </div>
        <Button onClick={openCreate} data-testid="button-add-lease">
          <Plus className="h-4 w-4 mr-2" />
          New Lease
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by warehouse or tenant..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-leases" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-lease-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-4 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No leases found</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first lease agreement</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id} data-testid={`row-lease-${l.id}`}>
                    <TableCell className="font-medium" data-testid={`text-lease-warehouse-${l.id}`}>{getWarehouseLabel(l.warehouseId)}</TableCell>
                    <TableCell>{getTenantLabel(l.tenantId)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{l.startDate} - {l.endDate}</p>
                        {l.status === "active" && isExpiringSoon(l.endDate) && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">Expiring soon</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(l.rentalAmount)}</TableCell>
                    <TableCell className="capitalize">{l.paymentFrequency}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor(l.status)} className="capitalize">{l.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(l)} data-testid={`button-edit-lease-${l.id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(l.id)} data-testid={`button-delete-lease-${l.id}`}>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLease ? "Edit Lease" : "New Lease"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Warehouse</Label>
                <Select value={String(form.warehouseId)} onValueChange={(v) => setForm({ ...form, warehouseId: parseInt(v) })}>
                  <SelectTrigger data-testid="select-warehouse"><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>
                    {warehouses?.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>{w.unitNumber} - {w.location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tenant</Label>
                <Select value={String(form.tenantId)} onValueChange={(v) => setForm({ ...form, tenantId: parseInt(v) })}>
                  <SelectTrigger data-testid="select-tenant"><SelectValue placeholder="Select tenant" /></SelectTrigger>
                  <SelectContent>
                    {tenants?.filter((t) => t.isActive).map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required data-testid="input-start-date" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required data-testid="input-end-date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rental Amount</Label>
                <Input type="number" step="0.01" value={form.rentalAmount} onChange={(e) => setForm({ ...form, rentalAmount: e.target.value })} required data-testid="input-rental-amount" />
              </div>
              <div className="space-y-2">
                <Label>Payment Frequency</Label>
                <Select value={form.paymentFrequency!} onValueChange={(v) => setForm({ ...form, paymentFrequency: v as any })}>
                  <SelectTrigger data-testid="select-frequency"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Security Deposit</Label>
                <Input type="number" step="0.01" value={form.securityDeposit!} onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })} data-testid="input-security-deposit" />
              </div>
              <div className="space-y-2">
                <Label>Late Fee (%)</Label>
                <Input type="number" step="0.01" value={form.lateFeePercentage!} onChange={(e) => setForm({ ...form, lateFeePercentage: e.target.value })} data-testid="input-late-fee" />
              </div>
              <div className="space-y-2">
                <Label>Grace Period (days)</Label>
                <Input type="number" value={form.gracePeriodDays!} onChange={(e) => setForm({ ...form, gracePeriodDays: parseInt(e.target.value) || 0 })} data-testid="input-grace-period" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status!} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger data-testid="select-lease-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} data-testid="input-lease-notes" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-lease">
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingLease ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Lease</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} data-testid="button-confirm-delete-lease">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
