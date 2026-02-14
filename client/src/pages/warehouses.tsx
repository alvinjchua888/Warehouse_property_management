import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Search, Warehouse, Pencil, Trash2, MapPin, Maximize2 } from "lucide-react";
import type { Warehouse as WarehouseType, InsertWarehouse } from "@shared/schema";

export default function Warehouses() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseType | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [form, setForm] = useState<InsertWarehouse>({
    unitNumber: "",
    location: "",
    sizeSqm: 0,
    rentalRate: "0",
    status: "vacant",
    amenities: "",
    description: "",
  });

  const { data: warehouses, isLoading } = useQuery<WarehouseType[]>({ queryKey: ["/api/warehouses"] });

  const createMutation = useMutation({
    mutationFn: (data: InsertWarehouse) => apiRequest("POST", "/api/warehouses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warehouses"] });
      toast({ title: "Warehouse created successfully" });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertWarehouse> }) =>
      apiRequest("PATCH", `/api/warehouses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warehouses"] });
      toast({ title: "Warehouse updated successfully" });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/warehouses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warehouses"] });
      toast({ title: "Warehouse deleted successfully" });
      setDeleteId(null);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = warehouses?.filter((w) => {
    const matchSearch =
      w.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
      w.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  function openCreate() {
    setEditingWarehouse(null);
    setForm({ unitNumber: "", location: "", sizeSqm: 0, rentalRate: "0", status: "vacant", amenities: "", description: "" });
    setDialogOpen(true);
  }

  function openEdit(w: WarehouseType) {
    setEditingWarehouse(w);
    setForm({
      unitNumber: w.unitNumber,
      location: w.location,
      sizeSqm: w.sizeSqm,
      rentalRate: w.rentalRate,
      status: w.status,
      amenities: w.amenities ?? "",
      description: w.description ?? "",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingWarehouse(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingWarehouse) {
      updateMutation.mutate({ id: editingWarehouse.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "vacant": return "secondary";
      case "occupied": return "default";
      case "maintenance": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-warehouses-title">Warehouses</h1>
          <p className="text-muted-foreground mt-1">Manage your warehouse units</p>
        </div>
        <Button onClick={openCreate} data-testid="button-add-warehouse">
          <Plus className="h-4 w-4 mr-2" />
          Add Warehouse
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by unit number or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-warehouses"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="vacant">Vacant</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Warehouse className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No warehouses found</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first warehouse to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w) => (
            <Card key={w.id} className="hover-elevate" data-testid={`card-warehouse-${w.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate" data-testid={`text-unit-${w.id}`}>{w.unitNumber}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{w.location}</span>
                    </div>
                  </div>
                  <Badge variant={statusColor(w.status)} className="shrink-0 capitalize">{w.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Size</p>
                    <p className="font-medium flex items-center gap-1" data-testid={`text-size-${w.id}`}>
                      <Maximize2 className="h-3 w-3" />
                      {w.sizeSqm.toLocaleString()} sqm
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Rate</p>
                    <p className="font-medium" data-testid={`text-rate-${w.id}`}>{formatCurrency(w.rentalRate)}/mo</p>
                  </div>
                </div>
                {w.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{w.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(w)} data-testid={`button-edit-warehouse-${w.id}`}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(w.id)} data-testid={`button-delete-warehouse-${w.id}`}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitNumber">Unit Number</Label>
                <Input id="unitNumber" value={form.unitNumber} onChange={(e) => setForm({ ...form, unitNumber: e.target.value })} required data-testid="input-unit-number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required data-testid="input-location" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sizeSqm">Size (sqm)</Label>
                <Input id="sizeSqm" type="number" value={form.sizeSqm} onChange={(e) => setForm({ ...form, sizeSqm: parseInt(e.target.value) || 0 })} required data-testid="input-size" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalRate">Rental Rate (/mo)</Label>
                <Input id="rentalRate" type="number" step="0.01" value={form.rentalRate} onChange={(e) => setForm({ ...form, rentalRate: e.target.value })} required data-testid="input-rental-rate" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status!} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger data-testid="select-warehouse-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities</Label>
              <Input id="amenities" value={form.amenities ?? ""} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Loading dock, Climate control..." data-testid="input-amenities" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} data-testid="input-description" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-warehouse">
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingWarehouse ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Warehouse</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this warehouse? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} data-testid="button-confirm-delete">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
