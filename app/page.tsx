"use client";

import useSWR from "swr";
import {
  AlertTriangle,
  Car,
  Activity,
  Zap,
  MapPin,
  MoreHorizontal,
  CloudSun,
  Droplets,
  Wind,
  Gauge,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CityOverviewWidget from "@/components/ui/CityOverviewWidget";

/** ---------- fetcher + helpers ---------- **/
const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed ${url}`);
  return res.json();
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function fmtTime(value: string | number | Date) {
  const d = new Date(value);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** ---------- tiny UI primitives (Tailwind-only) ---------- **/
function Badge({
  variant,
  children,
}: {
  variant: "critical" | "high" | "medium" | "low" | "info" | "success" | "warning";
  children: React.ReactNode;
}) {
  const styles =
    variant === "critical"
      ? "bg-red-500/10 text-red-700 border-red-500/20"
      : variant === "high"
      ? "bg-rose-500/10 text-rose-700 border-rose-500/20"
      : variant === "medium"
      ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
      : variant === "warning"
      ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
      : variant === "success"
      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
      : variant === "low"
      ? "bg-slate-500/10 text-slate-700 border-slate-500/20"
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
          <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="More">
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

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200/70", className)} />;
}

/** ---------- types (loose) ---------- **/
type Stats = { incidents: number; fleetOnline: number; trainFaults: number; evUsage: number };

type IncidentRow = {
  incidentLocation: string;
  severity: string;
  incidentType?: string;
  timestamp: string;
  latitude?: number | null;
  longitude?: number | null;
};

type CongestionRow = { timestamp: string; trafficDensity: number };

type OverviewRow = {
  bucket: string;
  avgTrafficDensity: number | null;
  avgSpeed: number | null;
  avgBusOccupancy: number | null;
  incidentCount: number | null;
};

type WeatherResponse = {
  latest: {
    timestamp: string;
    condition: string | null;
    roadCondition: string | null;
    temperature?: number | null;
    visibility?: number | null;
  } | null;
  road30m: Array<{ roadCondition: string; cnt: number }>;
};

type IncidentSummary = {
  severity: Array<{ severity: string; cnt: number }>;
  laneBlockedPct: number;
};

type FleetSummary = { avgFuelMpg: number | null; idleVehicles: number; healthAlerts: number };

type Parking = { occupied: number; available: number; total: number; percentage: number };

type EvCharging = {
  data: Array<{ timestamp: string; currentKw: number }>;
  stations: { available: number; total: number };
};

export default function Page() {
  const swrOpts = { refreshInterval: 5000, revalidateOnFocus: true, dedupingInterval: 1000 };

  const { data: stats, isLoading: statsLoading } = useSWR<Stats>("/api/stats", fetcher, swrOpts);
  const { data: incidents, isLoading: incidentsLoading } = useSWR<IncidentRow[]>("/api/incidents", fetcher, swrOpts);
  const { data: congestion, isLoading: congestionLoading } = useSWR<CongestionRow[]>("/api/congestion", fetcher, swrOpts);

  // New “useful” widgets
  const { data: overview, isLoading: overviewLoading } = useSWR<OverviewRow[]>("/api/overview", fetcher, swrOpts);
  const { data: weather, isLoading: weatherLoading } = useSWR<WeatherResponse>("/api/weather", fetcher, swrOpts);
  const { data: incSummary, isLoading: incSummaryLoading } = useSWR<IncidentSummary>("/api/incidents-summary", fetcher, swrOpts);

  // Existing widgets you already have
  const { data: fleet, isLoading: fleetLoading } = useSWR<FleetSummary>("/api/fleet", fetcher, swrOpts);
  const { data: parking, isLoading: parkingLoading } = useSWR<Parking>("/api/parking", fetcher, swrOpts);
  const { data: ev, isLoading: evLoading } = useSWR<EvCharging>("/api/ev-charging", fetcher, swrOpts);

  /** ---------- shape chart data ---------- **/
  const congestionData =
    (congestion ?? []).map((r) => ({
      t: fmtTime(r.timestamp),
      density: Number(r.trafficDensity ?? 0),
    })) ?? [];

  const opsPulse =
    (overview ?? []).map((r) => ({
      t: fmtTime(r.bucket),
      traffic: Number(r.avgTrafficDensity ?? 0),
      speed: Number(r.avgSpeed ?? 0),
      busOcc: Number(r.avgBusOccupancy ?? 0),
      incidents: Number(r.incidentCount ?? 0),
    })) ?? [];

  const parkingData = parking
    ? [
        { name: "Occupied", value: parking.occupied, color: "#3b82f6" },
        { name: "Available", value: parking.available, color: "#10b981" },
      ]
    : [
        { name: "Occupied", value: 0, color: "#3b82f6" },
        { name: "Available", value: 0, color: "#10b981" },
      ];

  const severityOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const severityData =
    (incSummary?.severity ?? [])
      .map((s) => ({ sev: (s.severity ?? "").toUpperCase(), cnt: Number(s.cnt ?? 0) }))
      .sort((a, b) => severityOrder.indexOf(a.sev) - severityOrder.indexOf(b.sev)) ?? [];

  const evChargingData =
    (ev?.data ?? []).map((r) => ({
      t: fmtTime(r.timestamp),
      kw: Number(r.currentKw ?? 0),
    })) ?? [];

  const evTotal = ev?.stations?.total ?? 0;
  const evAvailable = ev?.stations?.available ?? 0;
  const evInUse = Math.max(0, evTotal - evAvailable);
  const evUtilPct = evTotal ? Math.round((evInUse / evTotal) * 100) : 0;

  const latestWeather = weather?.latest ?? null;
  const roadCounts = weather?.road30m ?? [];
  const wetCnt = roadCounts.find((x) => (x.roadCondition ?? "").toUpperCase() === "WET")?.cnt ?? 0;
  const dryCnt = roadCounts.find((x) => (x.roadCondition ?? "").toUpperCase() === "DRY")?.cnt ?? 0;
  const roadTotal = wetCnt + dryCnt + roadCounts.reduce((acc, x) => {
    const rc = (x.roadCondition ?? "").toUpperCase();
    if (rc === "WET" || rc === "DRY") return acc;
    return acc + (x.cnt ?? 0);
  }, 0);
  const wetPct = roadTotal ? Math.round((wetCnt / roadTotal) * 100) : 0;

  /** ---------- severity badge mapping ---------- **/
  function sevVariant(sev: string) {
    const s = (sev || "").toUpperCase();
    if (s === "CRITICAL") return "critical";
    if (s === "HIGH") return "high";
    if (s === "MEDIUM") return "medium";
    if (s === "LOW") return "low";
    return "info";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Smart Transport Monitoring Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">Real-time overview • Auto-refresh every 5s</p>
          </div>
          <div className="text-xs text-slate-500">
            Last updated: <span className="font-medium text-slate-700">every 5 seconds</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            label="Traffic Incidents"
            value={statsLoading ? "—" : stats?.incidents ?? "—"}
            sub="Active alerts (last 1h)"
            icon={AlertTriangle}
            tone="red"
          />
          <StatCard
            label="Fleet Status"
            value={statsLoading ? "—" : stats?.fleetOnline ?? "—"}
            sub="Vehicles online (5m)"
            icon={Car}
            tone="green"
          />
          <StatCard
            label="Train Faults"
            value={statsLoading ? "—" : stats?.trainFaults ?? "—"}
            sub="Issues detected (1h)"
            icon={Activity}
            tone="orange"
          />
          <StatCard
            label="EV Chargers"
            value={statsLoading ? "—" : `${stats?.evUsage ?? 0}%`}
            sub="Avg load (10m)"
            icon={Zap}
            tone="blue"
          />
        </div>

        {/* Main grid */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* City Overview (map) + useful overlay chart */}
          <div className="lg:col-span-2">
            <CardShell
              title="City Overview"
              subtitle="Live pins • plus operations pulse (last 30m)"
              right={
                <div className="flex items-center gap-2">
                  <Badge variant="success">Online</Badge>
                  <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="More">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              }
            >
              <div className="relative h-64 overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 via-white to-emerald-50">
                {/* soft background texture */}
                <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_30%_30%,#93c5fd_0,transparent_55%),radial-gradient(circle_at_70%_60%,#86efac_0,transparent_55%)]" />

                {/* mock pins (replace later with /api/locations if you want) */}
                <div className="absolute left-[28%] top-[25%] rounded-full bg-white p-2 shadow">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="absolute left-[58%] top-[30%] rounded-full bg-white p-2 shadow">
                  <Car className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="absolute left-[20%] top-[55%] rounded-full bg-white p-2 shadow">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>

                {/* legend */}
                <div className="absolute bottom-3 left-3 flex gap-2 rounded-lg border bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500" /> Incident
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Fleet
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500" /> EV
                  </span>
                </div>

                {/* Useful overlay: Operations Pulse */}
                <div className="absolute bottom-3 right-3 w-[320px] rounded-xl border bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Operations Pulse</div>
                      <div className="mt-0.5 text-xs text-slate-500">Traffic density + incidents</div>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="px-4 py-3">
                    <div className="h-[90px]">
                      {overviewLoading ? (
                        <Skeleton className="h-full w-full" />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={opsPulse}>
                            <Tooltip />
                            <Area
                              type="monotone"
                              dataKey="traffic"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              fill="rgba(59,130,246,0.15)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-semibold text-slate-900">
                          {opsPulse.length ? Math.round(opsPulse[opsPulse.length - 1].traffic) : "—"}
                        </div>
                        <div className="text-[11px] text-slate-500">Density</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-900">
                          {opsPulse.length ? Math.round(opsPulse[opsPulse.length - 1].speed) : "—"}
                        </div>
                        <div className="text-[11px] text-slate-500">Avg Speed</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-900">
                          {opsPulse.length ? Math.round(opsPulse[opsPulse.length - 1].incidents) : "—"}
                        </div>
                        <div className="text-[11px] text-slate-500">Incidents</div>
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
              {incidentsLoading ? (
                <>
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </>
              ) : (incidents ?? []).length ? (
                (incidents ?? []).slice(0, 5).map((inc, i) => {
                  const sev = (inc.severity ?? "INFO").toUpperCase();
                  return (
                    <div key={i} className="flex items-start justify-between gap-3 rounded-lg border bg-slate-50 px-3 py-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={cn("mt-0.5 h-4 w-4", sev === "CRITICAL" ? "text-red-600" : sev === "HIGH" ? "text-rose-600" : sev === "MEDIUM" ? "text-amber-600" : "text-slate-600")} />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{inc.incidentLocation}</div>
                          <div className="text-xs text-slate-500">{fmtTime(inc.timestamp)}</div>
                        </div>
                      </div>
                      <Badge variant={sevVariant(sev) as any}>{sev}</Badge>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-lg border bg-slate-50 px-3 py-3 text-sm text-slate-500">No incidents detected.</div>
              )}
            </div>
          </CardShell>
        </div>

        {/* Second row: Traffic + Weather + Incidents summary */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Traffic Congestion */}
          <CardShell title="Traffic Congestion" subtitle="Last 30 minutes • density trend">
            <div className="h-[140px]">
              {congestionLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={congestionData}>
                    <Tooltip />
                    <Area type="monotone" dataKey="density" stroke="#ef4444" strokeWidth={2} fill="rgba(239,68,68,0.15)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="font-medium text-red-700">High congestion</span>
              <span className="text-slate-500">(auto-detected)</span>
            </div>
          </CardShell>

          {/* Weather + Road Condition */}
          <CardShell title="Weather & Road" subtitle="Live condition • last 30m wet ratio">
            {weatherLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <CloudSun className="h-4 w-4 text-slate-600" />
                      {latestWeather?.condition ? latestWeather.condition : "—"}
                      {latestWeather?.roadCondition ? (
                        <span className="ml-1">
                          <Badge variant={(latestWeather.roadCondition.toUpperCase() === "WET" ? "warning" : "success") as any}>
                            {latestWeather.roadCondition.toUpperCase()}
                          </Badge>
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {latestWeather?.timestamp ? `Updated ${fmtTime(latestWeather.timestamp)}` : "No weather readings"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-500">Wet last 30m</div>
                    <div className="text-lg font-semibold text-slate-900">{wetPct}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Gauge className="h-4 w-4" /> Temp
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {latestWeather?.temperature ?? "—"}
                      <span className="text-sm font-medium text-slate-500">°C</span>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Wind className="h-4 w-4" /> Visibility
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {latestWeather?.visibility ?? "—"}
                      <span className="text-sm font-medium text-slate-500"> m</span>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Droplets className="h-4 w-4" /> Lane risk
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {incSummary?.laneBlockedPct ?? "—"}
                      <span className="text-sm font-medium text-slate-500">%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Wet probability</span>
                    <span>{wetPct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${clamp(wetPct, 0, 100)}%` }} />
                  </div>
                </div>
              </div>
            )}
          </CardShell>

          {/* Incidents summary */}
          <CardShell title="Incidents Breakdown" subtitle="Last 2 hours • by severity">
            {incSummaryLoading ? (
              <Skeleton className="h-[180px] w-full" />
            ) : (
              <div className="space-y-3">
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={severityData}>
                      <XAxis dataKey="sev" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="cnt" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-slate-50 px-3 py-2">
                  <div className="text-sm font-medium text-slate-900">Lane blocked rate</div>
                  <Badge variant={(incSummary?.laneBlockedPct ?? 0) >= 40 ? "warning" : "info"}>
                    {incSummary?.laneBlockedPct ?? 0}%
                  </Badge>
                </div>
              </div>
            )}
          </CardShell>
        </div>

        {/* Third row: Parking + Fleet + EV Charging */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Parking */}
          <CardShell
            title="Parking Availability"
            subtitle="Current snapshot (note: will stay static until parking sensor data is streamed)"
          >
            {parkingLoading ? (
              <Skeleton className="h-[190px] w-full" />
            ) : (
              <div className="relative">
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={parkingData} dataKey="value" innerRadius={52} outerRadius={72} startAngle={90} endAngle={-270}>
                        {parkingData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip />
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
            )}
          </CardShell>

          {/* Fleet Monitoring */}
          <CardShell title="Fleet Monitoring" subtitle="Latest per vehicle (10m window)">
            {fleetLoading ? (
              <Skeleton className="h-[190px] w-full" />
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border bg-slate-50 p-3 text-center">
                  <div className="text-xs text-slate-500">Avg Fuel</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">
                    {fleet?.avgFuelMpg != null ? fleet.avgFuelMpg.toFixed(1) : "—"}
                  </div>
                  <div className="text-xs text-slate-500">MPG</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3 text-center">
                  <div className="text-xs text-slate-500">Idle/Offline</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">{fleet?.idleVehicles ?? "—"}</div>
                  <div className="text-xs text-slate-500">Units</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3 text-center">
                  <div className="text-xs text-slate-500">Health Alerts</div>
                  <div className="mt-1 text-2xl font-semibold text-red-600">{fleet?.healthAlerts ?? "—"}</div>
                  <div className="text-xs text-slate-500">Active</div>
                </div>
              </div>
            )}
          </CardShell>

          {/* EV Charging Status (with capacity utilization + availability from your route) */}
          <CardShell title="EV Charging Status" subtitle="Last 20m load • availability (5m)">
            {evLoading ? (
              <Skeleton className="h-[210px] w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Current Load</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">
                      {evChargingData.length ? Math.round(evChargingData[evChargingData.length - 1].kw) : "—"}
                      <span className="text-sm font-medium text-slate-500"> kW</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Utilization</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">{evUtilPct}%</div>
                  </div>
                </div>

                <div className="h-[110px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={evChargingData}>
                      <Tooltip />
                      <Bar dataKey="kw" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Stations Available</span>
                  <span className="font-semibold text-slate-900">
                    {evAvailable} / {evTotal}
                  </span>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Capacity in use</span>
                    <span>
                      {evInUse} / {evTotal}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${clamp(evUtilPct, 0, 100)}%` }} />
                  </div>
                </div>
              </div>
            )}
          </CardShell>
        </div>

        {/* Optional: extra useful row (Operations Pulse details) */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <CardShell title="Operations Pulse (Detailed)" subtitle="Traffic + speed + bus occupancy + incidents (30m)">
            {overviewLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={opsPulse}>
                    <Tooltip />
                    <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Area type="monotone" dataKey="traffic" stroke="#3b82f6" fill="rgba(59,130,246,0.12)" strokeWidth={2} />
                    <Area type="monotone" dataKey="busOcc" stroke="#10b981" fill="rgba(16,185,129,0.10)" strokeWidth={2} />
                    <Area type="monotone" dataKey="incidents" stroke="#ef4444" fill="rgba(239,68,68,0.10)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardShell>

          <CardShell title="Road Risk Indicator" subtitle="Quick read based on weather + lane blocks">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-600">Road condition</span>
                <Badge variant={(latestWeather?.roadCondition ?? "").toUpperCase() === "WET" ? "warning" : "success"}>
                  {(latestWeather?.roadCondition ?? "—").toString().toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-600">Weather</span>
                <Badge variant="info">{(latestWeather?.condition ?? "—").toString().toUpperCase()}</Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-600">Lane blocked rate (2h)</span>
                <Badge variant={(incSummary?.laneBlockedPct ?? 0) >= 40 ? "warning" : "info"}>
                  {incSummary?.laneBlockedPct ?? "—"}%
                </Badge>
              </div>

              <div className="text-xs text-slate-500">
                If you want, we can add a computed “Risk Score” (0–100) combining wetPct + laneBlockedPct + density.
              </div>
            </div>
          </CardShell>
{/* 
          <CardShell title="City Overview Notes" subtitle="What to add next for max usefulness">
            <div className="space-y-2 text-sm text-slate-700">
              <div className="rounded-lg border bg-slate-50 px-3 py-2">
                ✅ Add <span className="font-semibold">/api/locations</span> pins if your SQL rows have latitude/longitude.
              </div>
              <div className="rounded-lg border bg-slate-50 px-3 py-2">
                ✅ Replace Parking mock with <span className="font-semibold">sensorType='parking'</span> stream.
              </div>
              <div className="rounded-lg border bg-slate-50 px-3 py-2">
                ✅ Add Bus overcrowding widget if you create <span className="font-semibold">/api/bus</span> (occupancy distribution).
              </div>
            </div>
          </CardShell> */}

          <div className="lg:col-span-2">
  <CityOverviewWidget fetcher={fetcher} swrOpts={swrOpts} autoFit />
</div>
        </div>
      </div>
    </div>
  );
}
