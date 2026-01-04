"use client";

import { useEffect, useMemo, useRef } from "react";
import useSWR from "swr";
import mapboxgl from "mapbox-gl";
import { MoreHorizontal } from "lucide-react";

type LocationRow = {
  sensorType: "incident" | "fleet" | "ev" | "bus";
  latitude: number;
  longitude: number;
  incidentLocation?: string | null;
  severity?: string | null;
  vehicleId?: string | null;
  stationId?: string | null;
};

type Props = {
  fetcher: (url: string) => Promise<any>;
  swrOpts?: any;
  autoFit?: boolean;
  defaultCenter?: [number, number];
  defaultZoom?: number;
};

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

function LegendDot({ color }: { color: string }) {
  return <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />;
}

export default function CityOverviewWidget({
  fetcher,
  swrOpts,
  autoFit = true,
  defaultCenter = [103.8198, 1.3521],
  defaultZoom = 11,
}: Props) {
  const { data: locations, isLoading } = useSWR<LocationRow[]>("/api/locations", fetcher, swrOpts);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const geojson = useMemo(() => {
    const feats =
      (locations ?? [])
        .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude))
        .map((p) => {
          const sensorType = p.sensorType;
          const severity = (p.severity ?? "").toUpperCase();

          const label =
            sensorType === "incident"
              ? `${p.incidentLocation ?? "Incident"} • ${severity || "—"}`
              : sensorType === "fleet"
              ? `Fleet • ${p.vehicleId ?? "Vehicle"}`
              : sensorType === "ev"
              ? `EV • ${p.stationId ?? "Station"}`
              : `Bus`;

          return {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [Number(p.longitude), Number(p.latitude)] as [number, number],
            },
            properties: {
              sensorType,
              severity,
              label,
            },
          };
        }) ?? [];

    return { type: "FeatureCollection" as const, features: feats };
  }, [locations]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const didInitRef = useRef(false);

  // INIT ONCE (safe with strict mode)
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    if (!containerRef.current) return;
    if (!token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: defaultCenter,
      zoom: defaultZoom,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      // Add source (only once)
      if (!map.getSource("livePoints")) {
        map.addSource("livePoints", {
          type: "geojson",
          data: geojson,
        });
      }

      // Add layer (only once)
      if (!map.getLayer("livePoints-layer")) {
        map.addLayer({
          id: "livePoints-layer",
          type: "circle",
          source: "livePoints",
          paint: {
            "circle-radius": 7,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",

            "circle-color": [
              "case",
              // incidents by severity
              ["all", ["==", ["get", "sensorType"], "incident"], ["==", ["get", "severity"], "CRITICAL"]],
              "#ef4444",
              ["all", ["==", ["get", "sensorType"], "incident"], ["==", ["get", "severity"], "HIGH"]],
              "#f43f5e",
              ["all", ["==", ["get", "sensorType"], "incident"], ["==", ["get", "severity"], "MEDIUM"]],
              "#f59e0b",
              ["==", ["get", "sensorType"], "incident"],
              "#64748b",

              ["==", ["get", "sensorType"], "fleet"],
              "#10b981",
              ["==", ["get", "sensorType"], "ev"],
              "#3b82f6",
              ["==", ["get", "sensorType"], "bus"],
              "#a855f7",

              "#0ea5e9",
            ],
            "circle-opacity": 0.95,
          },
        });

        // Cursor change
        map.on("mouseenter", "livePoints-layer", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "livePoints-layer", () => (map.getCanvas().style.cursor = ""));

        // Popup
        map.on("click", "livePoints-layer", (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const coords = (f.geometry as any).coordinates.slice();
          const label = (f.properties as any)?.label ?? "Event";
          const type = (f.properties as any)?.sensorType ?? "";
          const sev = (f.properties as any)?.severity ?? "";

          new mapboxgl.Popup({ closeButton: true, closeOnClick: true })
            .setLngLat(coords)
            .setHTML(
              `<div style="font-size:12px;">
                <div style="font-weight:700;margin-bottom:2px;">${label}</div>
                <div style="opacity:.7;">${String(type).toUpperCase()} ${sev ? "• " + String(sev).toUpperCase() : ""}</div>
              </div>`
            )
            .addTo(map);
        });
      }

      mapRef.current = map;
    });

    return () => {
      map.remove();
      mapRef.current = null;
      didInitRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Update data whenever SWR refreshes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const src = map.getSource("livePoints") as mapboxgl.GeoJSONSource | undefined;
    if (src) {
      src.setData(geojson as any);
    }
  }, [geojson]);

  // Fit bounds when points exist (after data updates)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !autoFit) return;
    const feats = (geojson as any)?.features ?? [];
    if (!feats.length) return;

    const bounds = new mapboxgl.LngLatBounds();
    feats.forEach((f: any) => bounds.extend(f.geometry.coordinates));
    map.fitBounds(bounds, { padding: 60, duration: 700, maxZoom: 13 });
  }, [geojson, autoFit]);

  const counts = useMemo(() => {
    const feats = (geojson as any)?.features ?? [];
    const c = { incident: 0, fleet: 0, ev: 0, bus: 0 };
    for (const f of feats) {
      const t = f?.properties?.sensorType;
      if (t && t in c) (c as any)[t] += 1;
    }
    return c;
  }, [geojson]);

  return (
    <CardShell
      title="City Overview"
      subtitle="Mapbox view • live geo points"
      right={
        <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="More">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      }
    >
      <div className="relative h-64 overflow-hidden rounded-xl border bg-white">
        {!token ? (
          <div className="absolute inset-0 grid place-items-center bg-white">
            <div className="text-sm font-semibold text-red-600">
              Missing NEXT_PUBLIC_MAPBOX_TOKEN (check .env.local and restart)
            </div>
          </div>
        ) : null}

        <div ref={containerRef} className="absolute inset-0" />

        {isLoading ? (
          <div className="absolute inset-0 grid place-items-center bg-white/60">
            <div className="text-sm font-medium text-slate-600">Loading locations…</div>
          </div>
        ) : null}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-lg border bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm">
          <span className="flex items-center gap-1">
            <LegendDot color="#ef4444" /> Incident
          </span>
          <span className="flex items-center gap-1">
            <LegendDot color="#10b981" /> Fleet
          </span>
          <span className="flex items-center gap-1">
            <LegendDot color="#3b82f6" /> EV
          </span>
          <span className="flex items-center gap-1">
            <LegendDot color="#a855f7" /> Bus
          </span>
        </div>

        {/* Counts */}
        <div className="absolute bottom-3 right-3 rounded-lg border bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm">
          <div className="flex gap-3">
            <span>🚨 {counts.incident}</span>
            <span>🚗 {counts.fleet}</span>
            <span>⚡ {counts.ev}</span>
            <span>🚌 {counts.bus}</span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}
