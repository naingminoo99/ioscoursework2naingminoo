// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card';
import { AlertTriangle, Bus, Zap, Car, MapPin, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ incidents: 0, fleetOnline: 0, trainFaults: 0, evUsage: 0 });
  const [incidents, setIncidents] = useState([]);
  const [congestion, setCongestion] = useState([]);
  const [locations, setLocations] = useState([]);
  const [fleet, setFleet] = useState({ avgFuelMpg: 0, idleVehicles: 0, healthAlerts: 0 });
  const [parking, setParking] = useState({ occupied: 0, available: 0, percentage: 0 });
  const [evCharging, setEvCharging] = useState({ data: [], stations: { available: 0, total: 32 } });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, incidentsRes, congestionRes, locationsRes, fleetRes, parkingRes, evRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/incidents'),
          fetch('/api/congestion'),
          fetch('/api/locations'),
          fetch('/api/fleet'),
          fetch('/api/parking'),
          fetch('/api/ev-charging'),
        ]);

        setStats(await statsRes.json());
        setIncidents(await incidentsRes.json());
        setCongestion(await congestionRes.json());
        setLocations(await locationsRes.json());
        setFleet(await fleetRes.json());
        setParking(await parkingRes.json());
        setEvCharging(await evRes.json());
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600';
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-orange-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Smart Transport Monitoring Dashboard</h1>
          <p className="text-slate-600">Real-time city transport analytics</p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-l-4 border-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Traffic Incidents</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.incidents}</div>
              <p className="text-xs text-slate-500 mt-1">Active Alerts</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Fleet Status</CardTitle>
              <Car className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.fleetOnline}</div>
              <p className="text-xs text-slate-500 mt-1">Vehicles Online</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Train Faults</CardTitle>
              <Activity className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.trainFaults}</div>
              <p className="text-xs text-slate-500 mt-1">Issues Detected</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">EV Chargers</CardTitle>
              <Zap className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.evUsage}%</div>
              <p className="text-xs text-slate-500 mt-1">In Use</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* City Overview Map */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                City Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden">
                {/* Simple map visualization */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 800 400">
                    <path d="M100,200 L700,200" stroke="#64748b" strokeWidth="3" opacity="0.3"/>
                    <path d="M400,50 L400,350" stroke="#64748b" strokeWidth="3" opacity="0.3"/>
                    <path d="M200,100 L600,300" stroke="#64748b" strokeWidth="2" opacity="0.2"/>
                  </svg>
                </div>
                
                {/* Location markers */}
                {locations.map((loc: any, idx: number) => (
                  <div
                    key={idx}
                    className="absolute"
                    style={{
                      left: `${((loc.longitude - 103.6) / 0.4) * 100}%`,
                      top: `${((1.47 - loc.latitude) / 0.24) * 100}%`,
                    }}
                  >
                    {loc.sensorType === 'incident' && (
                      <div className="relative group">
                        <AlertTriangle className="h-6 w-6 text-red-600 drop-shadow-lg animate-pulse" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {loc.incidentLocation} - {loc.severity}
                        </div>
                      </div>
                    )}
                    {loc.sensorType === 'fleet' && (
                      <Car className="h-5 w-5 text-green-600 drop-shadow-lg" />
                    )}
                    {loc.sensorType === 'ev' && (
                      <Zap className="h-5 w-5 text-blue-600 drop-shadow-lg" />
                    )}
                    {loc.sensorType === 'bus' && (
                      <Bus className="h-5 w-5 text-purple-600 drop-shadow-lg" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Anomaly Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents.slice(0, 5).map((incident: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      incident.severity === 'CRITICAL' ? 'text-red-600' :
                      incident.severity === 'HIGH' ? 'text-red-500' :
                      incident.severity === 'MEDIUM' ? 'text-orange-500' : 'text-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{incident.incidentLocation || 'Unknown Location'}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(incident.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Traffic Congestion */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Congestion</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={congestion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="timestamp" tick={false} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="trafficDensity" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">High Congestion</span>
              </div>
            </CardContent>
          </Card>

          {/* Fleet Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle>Fleet Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Avg. Fuel Usage</span>
                  <span className="text-2xl font-bold">{fleet.avgFuelMpg?.toFixed(1) || 0}</span>
                  <span className="text-sm text-slate-500">MPG</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Idle Vehicles</span>
                  <span className="text-2xl font-bold">{fleet.idleVehicles || 0}</span>
                  <span className="text-sm text-slate-500">Units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Health Alerts</span>
                  <span className="text-2xl font-bold text-red-600">{fleet.healthAlerts || 0}</span>
                  <span className="text-sm text-slate-500">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EV Charging */}
          <Card>
            <CardHeader>
              <CardTitle>EV Charging Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={evCharging.data}>
                  <Bar dataKey="currentKw" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Current Load</span>
                  {/* <span className="font-bold">{evCharging.data[evCharging.data.length - 1]?.currentKw || 0} kW</span> */}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Stations Available</span>
                  <span className="font-bold">{evCharging.stations.available} / {evCharging.stations.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}