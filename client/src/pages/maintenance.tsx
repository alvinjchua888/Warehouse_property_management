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
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/components/currency-provider";
import { Plus, Search, Wrench, Pencil, Trash2, AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { MaintenanceRequest, InsertMaintenanceRequest, Warehouse as WarehouseType } from "@shared/schema";

export default function Maintenance() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const emptyForm: InsertMaintenanceRequest = {
    warehouseId: 0,
    title: "",
    description: "",
    category: "other",
    priority: "medium",
    status: "submitted",
    assignedTo: "",
    estimatedCost: "0",
    actualCost: "0",
    completedAt: "",
    notes: "",
  };

  const [form, setForm] = useState<InsertMaintenanceRequest>(emptyForm);

  const { data: requests, isLoading } = useQuery<MaintenanceRequest[]>({ queryKey: ["/api/maintenance"] });
  const { data: warehouses } = useQuery<WarehouseType[]>({ queryKey: ["/api/warehouses"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertMaintenanceRequest) => apiRequest("POST", "/api/maintenance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      toast({ title: "Maintenance request created" });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertMaintenanceRequest> }) =>
      apiRequest("PATCH", `/api/maintenance/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      toast({ title: "Request updated successfully" });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/maintenance/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      toast({ title: "Request deleted successfully" });
      setDeleteId(null);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const getWarehouseLabel = (id: number) => warehouses?.find((w) => w.id === id)?.unitNumber ?? `#${id}`;

  const filtered = requests?.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      getWarehouseLabel(r.warehouseId).toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  function openCreate() {
    setEditingRequest(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(r: MaintenanceRequest) {
    setEditingRequest(r);
    setForm({
      warehouseId: r.warehouseId,
      title: r.title,
      description: r.description,
      category: r.category,
      priority: r.priority,
      status: r.status,
      assignedTo: r.assignedTo ?? "",
      estimatedCost: r.estimatedCost,
      actualCost: r.actualCost,
      completedAt: r.completedAt ?? "",
      notes: r.notes ?? "",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingRequest(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingRequest) {
      updateMutation.mutate({ id: editingRequest.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "secondary";
      case "medium": return "default";
      case "high": return "destructive";
      case "urgent": return "destructive";
      default: return "secondary";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "submitted": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "in_progress": return <Clock className="h-4 w-4 text-blue-500" />;
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-maintenance-title">Maintenance</h1>
          <p className="text-muted-foreground mt-1">Track and manage maintenance requests</p>
        </div>
        <Button onClick={openCreate} data-testid="button-add-maintenance">
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by title or warehouse..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-maintenance" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-maintenance-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No maintenance requests</p>
            <p className="text-sm text-muted-foreground mt-1">Submit a new maintenance request</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <Card key={r.id} className="hover-elevate" data-testid={`card-maintenance-${r.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-2 min-w-0">
                    {statusIcon(r.status)}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate" data-testid={`text-maintenance-title-${r.id}`}>{r.title}</h3>
                      <p className="text-xs text-muted-foreground">{getWarehouseLabel(r.warehouseId)}</p>
                    </div>
                  </div>
                  <Badge variant={priorityColor(r.priority)} className="shrink-0 capitalize text-xs">{r.priority}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{r.description}</p>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">{r.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Est. Cost</p>
                    <p className="font-medium">{formatCurrency(r.estimatedCost)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{r.status.replace("_", " ")}</p>
                  </div>
                </div>
                {r.assignedTo && (
                  <p className="text-xs text-muted-foreground mb-3">Assigned to: {r.assignedTo}</p>
                )}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(r)} data-testid={`button-edit-maintenance-${r.id}`}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} data-testid={`button-delete-maintenance-${r.id}`}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRequest ? "Edit Request" : "New Maintenance Request"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Warehouse</Label>
              <Select value={String(form.warehouseId)} onValueChange={(v) => setForm({ ...form, warehouseId: parseInt(v) })}>
                <SelectTrigger data-testid="select-maintenance-warehouse"><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>
                  {warehouses?.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>{w.unitNumber} - {w.location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required data-testid="input-maintenance-title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} data-testid="input-maintenance-description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as any })}>
                  <SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority!} onValueChange={(v) => setForm({ ...form, priority: v as any })}>
                  <SelectTrigger data-testid="select-priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status!} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                  <SelectTrigger data-testid="select-maintenance-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <Input value={form.assignedTo ?? ""} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} data-testid="input-assigned-to" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estimated Cost</Label>
                <Input type="number" step="0.01" value={form.estimatedCost!} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} data-testid="input-estimated-cost" />
              </div>
              <div className="space-y-2">
                <Label>Actual Cost</Label>
                <Input type="number" step="0.01" value={form.actualCost!} onChange={(e) => setForm({ ...form, actualCost: e.target.value })} data-testid="input-actual-cost" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} data-testid="input-maintenance-notes" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-maintenance">
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingRequest ? "Update" : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Request</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} data-testid="button-confirm-delete-maintenance">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
