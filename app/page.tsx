"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

import {
  AlertTriangle,
  Car,
  Activity,
  Zap,
  MapPin,
  Bus,
  BarChart3,
  Navigation,
  Wrench,
  Bell,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

type Stats = {
  incidents: number;
  fleetOnline: number;
  trainFaults: number;
  evUsage: number; // you currently return avgLoad rounded
};

type IncidentRow = {
  incidentLocation: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  incidentType?: string;
  timestamp: string; // ISO from SQL
  latitude?: number;
  longitude?: number;
};

type CongestionRow = {
  timestamp: string;
  trafficDensity: number;
};

type FleetSummary = {
  avgFuelMpg: number | null;
  idleVehicles: number;
  healthAlerts: number;
};

type Parking = {
  occupied: number;
  available: number;
  total: number;
  percentage: number;
};

type EvCharging = {
  data: { timestamp: string; currentKw: number }[];
  stations: { available: number; total: number };
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const Card = ({ children, span }: { children: React.ReactNode; span?: number }) => (
  <div
    style={{
      backgroundColor: "white",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      overflow: "hidden",
      gridColumn: span ? `span ${span}` : "span 1",
    }}
  >
    {children}
  </div>
);

const CardHeader = ({ children, border }: { children: React.ReactNode; border?: boolean }) => (
  <div style={{ padding: "1.5rem", borderBottom: border ? "1px solid #e2e8f0" : "none" }}>
    {children}
  </div>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: "1.5rem" }}>{children}</div>
);

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  bgColor,
  iconColor,
}: {
  title: string;
  value: React.ReactNode;
  subtitle: string;
  icon: any;
  bgColor: string;
  iconColor: string;
}) => (
  <Card>
    <CardContent>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#475569", marginBottom: "0.25rem" }}>
            {title}
          </p>
          <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.25rem" }}>
            {value}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#64748b" }}>{subtitle}</p>
        </div>
        <div style={{ padding: "1rem", borderRadius: "0.75rem", backgroundColor: bgColor }}>
          <Icon style={{ height: "2rem", width: "2rem", color: iconColor }} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const swrOpts = {
    refreshInterval: 5000, // ✅ poll every 5s
    revalidateOnFocus: true,
    dedupingInterval: 1000,
  };

  const { data: stats } = useSWR<Stats>("/api/stats", fetcher, swrOpts);
  const { data: incidents } = useSWR<IncidentRow[]>("/api/incidents", fetcher, swrOpts);
  const { data: congestion } = useSWR<CongestionRow[]>("/api/congestion", fetcher, swrOpts);
  const { data: fleet } = useSWR<FleetSummary>("/api/fleet", fetcher, swrOpts);
  const { data: parking } = useSWR<Parking>("/api/parking", fetcher, swrOpts);
  const { data: ev } = useSWR<EvCharging>("/api/ev-charging", fetcher, swrOpts);

  // Shape data for charts (safe fallbacks while loading)
  const congestionData =
    congestion?.map((r) => ({
      time: formatTime(r.timestamp),
      level: r.trafficDensity,
    })) ?? [];

  const evChargingData =
    ev?.data?.map((r) => ({
      time: formatTime(r.timestamp),
      load: r.currentKw,
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f1f5f9, #dbeafe, #f1f5f9)",
        padding: "1.5rem",
      }}
    >
      <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 700, color: "#1e293b", marginBottom: "2rem" }}>
          Smart Transport Monitoring Dashboard
        </h1>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <StatCard
            title="Traffic Incidents"
            value={stats?.incidents ?? "—"}
            subtitle="Active Alerts (last 1 hour)"
            icon={AlertTriangle}
            bgColor="#fee2e2"
            iconColor="#dc2626"
          />
          <StatCard
            title="Fleet Status"
            value={stats?.fleetOnline ?? "—"}
            subtitle="Vehicles Online (last 5 min)"
            icon={Car}
            bgColor="#dcfce7"
            iconColor="#16a34a"
          />
          <StatCard
            title="Train Faults"
            value={stats?.trainFaults ?? "—"}
            subtitle="Issues Detected (last 1 hour)"
            icon={Activity}
            bgColor="#ffedd5"
            iconColor="#ea580c"
          />
          <StatCard
            title="EV Chargers"
            value={stats ? `${stats.evUsage}%` : "—"}
            subtitle="Avg Load (last 10 min)"
            icon={Zap}
            bgColor="#dbeafe"
            iconColor="#2563eb"
          />
        </div>

        {/* Main Grid - City Overview and Alerts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {/* City Map (still your visual mock; later you can place /api/locations pins here) */}
          <Card span={2}>
            <CardHeader border>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.125rem", fontWeight: 600, color: "#1e293b" }}>
                <MapPin style={{ height: "1.25rem", width: "1.25rem" }} />
                City Overview
              </div>
            </CardHeader>
            <CardContent>
              {/* keep your existing map mock */}
              <div
                style={{
                  position: "relative",
                  height: "16rem",
                  background: "linear-gradient(to bottom right, #dbeafe, #eff6ff, #dcfce7)",
                  borderRadius: "0.75rem",
                  border: "2px solid #93c5fd",
                  overflow: "hidden",
                }}
              >
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.3 }}>
                  <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#94a3b8" strokeWidth="2" />
                </svg>

                <div style={{ position: "absolute", left: "60%", top: "35%" }}>
                  <div style={{ backgroundColor: "white", padding: "0.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                    <Bus style={{ height: "1.5rem", width: "1.5rem", color: "#16a34a" }} />
                  </div>
                </div>

                <div style={{ position: "absolute", left: "25%", top: "55%" }}>
                  <div style={{ backgroundColor: "white", padding: "0.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                    <Activity style={{ height: "1.5rem", width: "1.5rem", color: "#ea580c" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anomaly Alerts */}
          <Card>
            <CardHeader border>
              <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1e293b" }}>Anomaly Alerts</div>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {(incidents ?? []).map((inc, i) => (
                  <div key={i} style={{ borderLeft: "4px solid #ef4444", backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "0 0.5rem 0.5rem 0" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                      <AlertTriangle
                        style={{
                          height: "1.25rem",
                          width: "1.25rem",
                          marginTop: "0.125rem",
                          color: inc.severity === "CRITICAL" ? "#dc2626" : inc.severity === "HIGH" ? "#ef4444" : "#f97316",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                          <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>{inc.incidentLocation}</p>
                          <span
                            style={{
                              padding: "0.125rem 0.5rem",
                              borderRadius: "0.25rem",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backgroundColor: inc.severity === "CRITICAL" ? "#dc2626" : inc.severity === "HIGH" ? "#ef4444" : "#f97316",
                              color: "white",
                            }}
                          >
                            {inc.severity}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "#64748b" }}>{formatTime(inc.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {!incidents?.length && (
                  <div style={{ color: "#64748b", fontSize: "0.875rem" }}>No incidents in the last 2 hours.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Analytics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {/* Traffic Congestion */}
          <Card>
            <CardHeader border>
              <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1e293b" }}>Traffic Congestion</div>
            </CardHeader>
            <CardContent>
              <p style={{ fontSize: "0.875rem", color: "#475569", marginBottom: "1rem" }}>Last 30 minutes</p>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={congestionData}>
                  <Area type="monotone" dataKey="level" stroke="#ef4444" strokeWidth={3} fill="rgba(239,68,68,0.15)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Fleet Monitoring */}
          <Card span={2}>
            <CardHeader border>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1e293b" }}>Fleet Monitoring</div>
                  <p style={{ fontSize: "0.875rem", color: "#475569", marginTop: "0.25rem" }}>Last 10 minutes</p>
                </div>
                <BarChart3 style={{ height: "1.25rem", width: "1.25rem", color: "#94a3b8" }} />
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#1e293b" }}>
                    {fleet?.avgFuelMpg != null ? fleet.avgFuelMpg.toFixed(1) : "—"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>Avg Fuel MPG</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#1e293b" }}>{fleet?.idleVehicles ?? "—"}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>Idle / Offline</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#dc2626" }}>{fleet?.healthAlerts ?? "—"}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>Health Alerts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {/* Parking */}
          <Card>
            <CardHeader border>
              <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1e293b" }}>Parking Availability</div>
            </CardHeader>
            <CardContent>
              <div style={{ position: "relative", marginBottom: "1rem" }}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={parkingData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270}>
                      {parkingData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2.25rem", fontWeight: 700, color: "#1e293b" }}>{parking?.percentage ?? "—"}%</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>Full</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#475569" }}>Available</span>
                  <span style={{ fontWeight: 700, color: "#1e293b" }}>{parking?.available ?? "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#475569" }}>Occupied</span>
                  <span style={{ fontWeight: 700, color: "#1e293b" }}>{parking?.occupied ?? "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EV Charging */}
          <Card span={2}>
            <CardHeader border>
              <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1e293b" }}>EV Charging Status</div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={evChargingData}>
                  <Bar dataKey="load" radius={[4, 4, 0, 0]}>
                    {(evChargingData ?? []).map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? "#3b82f6" : "#60a5fa"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.875rem", color: "#475569" }}>Stations Available</span>
                <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1e293b" }}>
                  {ev ? `${ev.stations.available} / ${ev.stations.total}` : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operational Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          <Card>
            <CardHeader border>
              <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1e293b" }}>Operational Actions</div>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem 1rem", backgroundColor: "#2563eb", color: "white", borderRadius: "0.5rem", fontWeight: 500, border: "none", cursor: "pointer" }}>
                  <Navigation style={{ height: "1rem", width: "1rem" }} />
                  Reroute Traffic
                </button>
                <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem 1rem", backgroundColor: "#475569", color: "white", borderRadius: "0.5rem", fontWeight: 500, border: "none", cursor: "pointer" }}>
                  <Wrench style={{ height: "1rem", width: "1rem" }} />
                  Dispatch Maintenance
                </button>
                <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem 1rem", backgroundColor: "#dc2626", color: "white", borderRadius: "0.5rem", fontWeight: 500, border: "none", cursor: "pointer" }}>
                  <Bell style={{ height: "1rem", width: "1rem" }} />
                  Send Alert
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
