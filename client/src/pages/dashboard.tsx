import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useCurrency } from "@/components/currency-provider";
import {
  Warehouse,
  Users,
  FileText,
  CreditCard,
  Wrench,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
} from "lucide-react";
import type { Warehouse as WarehouseType, Lease, Payment, MaintenanceRequest } from "@shared/schema";

export default function Dashboard() {
  const { formatCurrency } = useCurrency();
  const { data: warehouses, isLoading: wLoading } = useQuery<WarehouseType[]>({ queryKey: ["/api/warehouses"] });
  const { data: leases, isLoading: lLoading } = useQuery<Lease[]>({ queryKey: ["/api/leases"] });
  const { data: payments, isLoading: pLoading } = useQuery<Payment[]>({ queryKey: ["/api/payments"] });
  const { data: maintenance, isLoading: mLoading } = useQuery<MaintenanceRequest[]>({ queryKey: ["/api/maintenance"] });

  const isLoading = wLoading || lLoading || pLoading || mLoading;

  const totalUnits = warehouses?.length ?? 0;
  const occupiedUnits = warehouses?.filter((w) => w.status === "occupied").length ?? 0;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const totalRevenue = payments
    ?.filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amountPaid), 0) ?? 0;

  const overduePayments = payments?.filter((p) => p.status === "overdue").length ?? 0;

  const pendingMaintenance = maintenance?.filter(
    (m) => m.status === "submitted" || m.status === "in_progress"
  ).length ?? 0;

  const today = new Date();
  const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const upcomingExpirations = leases?.filter((lease) => {
    if (lease.status !== "active") return false;
    const endDate = new Date(lease.endDate);
    return endDate >= today && endDate <= sixtyDaysFromNow;
  }).length ?? 0;

  const activeLeases = leases?.filter((l) => l.status === "active").length ?? 0;

  const stats = [
    {
      title: "Total Units",
      value: totalUnits,
      subtitle: `${occupiedUnits} occupied`,
      icon: Warehouse,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      subtitle: `${occupiedUnits} of ${totalUnits} units`,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      subtitle: "From completed payments",
      icon: CreditCard,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "Active Leases",
      value: activeLeases,
      subtitle: `${upcomingExpirations} expiring soon`,
      icon: FileText,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      title: "Overdue Payments",
      value: overduePayments,
      subtitle: "Require attention",
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
    {
      title: "Pending Maintenance",
      value: pendingMaintenance,
      subtitle: "Open requests",
      icon: Wrench,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    },
  ];

  const quickActions = [
    { title: "Add Warehouse", description: "Create a new warehouse unit", href: "/warehouses", icon: Warehouse },
    { title: "Add Tenant", description: "Register a new tenant", href: "/tenants", icon: Users },
    { title: "Record Payment", description: "Log a rent payment", href: "/payments", icon: CreditCard },
    { title: "New Lease", description: "Create a lease agreement", href: "/leases", icon: FileText },
    { title: "Maintenance Request", description: "Submit a new request", href: "/maintenance", icon: Wrench },
  ];

  const recentPayments = payments?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor your warehouse property portfolio at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`} data-testid={`text-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  </div>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <div
                  className="flex items-center gap-3 p-3 rounded-md hover-elevate cursor-pointer"
                  data-testid={`link-quick-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
            <CardTitle className="text-base">Recent Payments</CardTitle>
            <Link href="/payments">
              <span className="text-xs text-primary cursor-pointer" data-testid="link-view-all-payments">View all</span>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CreditCard className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No payments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between gap-2" data-testid={`row-payment-${payment.id}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">Lease #{payment.leaseId}</p>
                        <p className="text-xs text-muted-foreground">Due: {payment.dueDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-medium">{formatCurrency(payment.amountDue)}</span>
                      <Badge
                        variant={
                          payment.status === "paid" ? "default" :
                          payment.status === "overdue" ? "destructive" :
                          "secondary"
                        }
                        className="text-xs"
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {upcomingExpirations > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-50 dark:bg-amber-950/30">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Lease Expiration Warning</p>
                <p className="text-xs text-muted-foreground">
                  {upcomingExpirations} lease{upcomingExpirations > 1 ? "s" : ""} expiring in the next 60 days.{" "}
                  <Link href="/leases">
                    <span className="text-primary cursor-pointer">Review now</span>
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
