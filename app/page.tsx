"use client";

import useSWR from "swr";
import {
  AlertTriangle,
  Car,
  Activity,
  Zap,
  MapPin,
  MoreHorizontal,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then(r => r.json());

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function Badge({ variant, children }: { variant: "critical" | "alert" | "warning" | "info"; children: React.ReactNode }) {
  const styles =
    variant === "critical"
      ? "bg-red-500/10 text-red-700 border-red-500/20"
      : variant === "alert"
      ? "bg-rose-500/10 text-rose-700 border-rose-500/20"
      : variant === "warning"
      ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
      : "bg-blue-500/10 text-blue-700 border-blue-500/20";

  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", styles)}>
      {children}
    </span>
  );
}

function CardShell({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-slate-500">{subtitle}</div> : null}
        </div>
        {right ?? (
          <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  icon: any;
  tone: "red" | "green" | "orange" | "blue";
}) {
  const toneMap = {
    red: "bg-red-500/10 text-red-600",
    green: "bg-emerald-500/10 text-emerald-600",
    orange: "bg-orange-500/10 text-orange-600",
    blue: "bg-blue-500/10 text-blue-600",
  }[tone];

  return (
    <div className="rounded-xl border bg-white shadow-sm px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
          <div className="mt-1 text-xs text-slate-500">{sub}</div>
        </div>
        <div className={cn("rounded-xl p-3", toneMap)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const opts = { refreshInterval: 5000, revalidateOnFocus: true, dedupingInterval: 1000 };

  const { data: stats } = useSWR("/api/stats", fetcher, opts);
  const { data: incidents } = useSWR("/api/incidents", fetcher, opts);
  const { data: congestion } = useSWR("/api/congestion", fetcher, opts);
  const { data: parking } = useSWR("/api/parking", fetcher, opts);

  const congestionData =
    (congestion ?? []).map((r: any) => ({ t: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), v: r.trafficDensity })) ?? [];

  const parkingData = parking
    ? [
        { name: "Occupied", value: parking.occupied, color: "#3b82f6" },
        { name: "Available", value: parking.available, color: "#10b981" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Smart Transport Monitoring Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Real-time overview • Auto-refresh every 5s
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Last updated: <span className="font-medium text-slate-700">just now</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            label="Traffic Incidents"
            value={stats?.incidents ?? "—"}
            sub="Active alerts (last 1h)"
            icon={AlertTriangle}
            tone="red"
          />
          <StatCard
            label="Fleet Status"
            value={stats?.fleetOnline ?? "—"}
            sub="Vehicles online (5m)"
            icon={Car}
            tone="green"
          />
          <StatCard
            label="Train Faults"
            value={stats?.trainFaults ?? "—"}
            sub="Issues detected (1h)"
            icon={Activity}
            tone="orange"
          />
          <StatCard
            label="EV Chargers"
            value={stats ? `${stats.evUsage}%` : "—"}
            sub="Avg load (10m)"
            icon={Zap}
            tone="blue"
          />
        </div>

        {/* Main grid */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* City Overview */}
          <div className="lg:col-span-2">
            <CardShell title="City Overview" subtitle="Live pins • incidents / fleet / stations" right={
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700">Online</span>
                <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            }>
              <div className="relative h-64 overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 via-white to-emerald-50">
                {/* fake map background */}
                <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_30%_30%,#93c5fd_0,transparent_55%),radial-gradient(circle_at_70%_60%,#86efac_0,transparent_55%)]" />
                {/* pins */}
                <div className="absolute left-[28%] top-[25%] rounded-full bg-white p-2 shadow">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="absolute left-[58%] top-[30%] rounded-full bg-white p-2 shadow">
                  <Car className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="absolute left-[20%] top-[55%] rounded-full bg-white p-2 shadow">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>

                {/* mini legend */}
                <div className="absolute bottom-3 left-3 flex gap-2 rounded-lg border bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Incident</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Fleet</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> EV</span>
                </div>

                {/* overlay card like your screenshot */}
                <div className="absolute bottom-3 right-3 w-[280px] rounded-xl border bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">Predictive Analytics</div>
                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="px-4 py-3">
                    <div className="text-xs text-slate-500 mb-2">Incident forecast</div>
                    <div className="h-[80px]">
                      {/* placeholder mini chart */}
                      <div className="h-full w-full rounded-lg bg-slate-50 border" />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-semibold text-slate-900">12</div>
                        <div className="text-[11px] text-slate-500">Breakdowns</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-900">8</div>
                        <div className="text-[11px] text-slate-500">Delays</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-900">15</div>
                        <div className="text-[11px] text-slate-500">High load</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardShell>
          </div>

          {/* Anomaly Alerts */}
          <CardShell title="Anomaly Alerts" subtitle="Last 2 hours • most recent first">
            <div className="space-y-3">
              {(incidents ?? []).slice(0, 5).map((inc: any, i: number) => {
                const sev = (inc.severity || "INFO").toUpperCase();
                const variant =
                  sev === "CRITICAL" ? "critical" : sev === "HIGH" ? "alert" : sev === "MEDIUM" ? "warning" : "info";

                return (
                  <div key={i} className="flex items-start justify-between gap-3 rounded-lg border bg-slate-50 px-3 py-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={cn("mt-0.5 h-4 w-4", variant === "critical" ? "text-red-600" : variant === "alert" ? "text-rose-600" : "text-amber-600")} />
                      <div>
                        <div className="text-sm font-medium text-slate-900">{inc.incidentLocation}</div>
                        <div className="text-xs text-slate-500">{new Date(inc.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                    <Badge variant={variant}>{sev}</Badge>
                  </div>
                );
              })}

              {!incidents?.length && (
                <div className="rounded-lg border bg-slate-50 px-3 py-3 text-sm text-slate-500">
                  No incidents detected.
                </div>
              )}
            </div>
          </CardShell>
        </div>

        {/* Lower grid */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <CardShell title="Traffic Congestion" subtitle="Last 30 minutes">
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={congestionData}>
                  <Area type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} fill="rgba(239,68,68,0.15)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="font-medium text-red-700">High congestion</span>
              <span className="text-slate-500">(auto-detected)</span>
            </div>
          </CardShell>

          <CardShell title="Parking Availability" subtitle="Live occupancy snapshot">
            <div className="relative">
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={parkingData} dataKey="value" innerRadius={52} outerRadius={72} startAngle={90} endAngle={-270}>
                      {parkingData.map((d: any, i: number) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-slate-900">{parking?.percentage ?? "—"}%</div>
                  <div className="text-xs text-slate-500">Full</div>
                </div>
              </div>

              <div className="mt-2 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Available</span>
                  <span className="font-semibold text-slate-900">{parking?.available ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Occupied</span>
                  <span className="font-semibold text-slate-900">{parking?.occupied ?? "—"}</span>
                </div>
              </div>
            </div>
          </CardShell>

          <CardShell title="Predictive Analytics" subtitle="Incident forecast">
            <div className="h-[180px] rounded-xl border bg-slate-50" />
            <div className="mt-3 text-xs text-slate-500">
              Tip: show “peak risk window” + top contributing factor (e.g. weather, density, faults).
            </div>
          </CardShell>
        </div>
      </div>
    </div>
  );
}
