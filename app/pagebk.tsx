
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Car, Activity, Zap, MapPin, Bus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ incidents: 0, fleetOnline: 0, trainFaults: 0, evUsage: 0 });
  const [incidents, setIncidents] = useState<any[]>([]);
  const [congestion, setCongestion] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [fleet, setFleet] = useState({ avgFuelMpg: 0, idleVehicles: 0, healthAlerts: 0 });
  const [parking, setParking] = useState({ occupied: 0, available: 0, percentage: 0 });
  const [evCharging, setEvCharging] = useState<{ data: any[], stations: { available: number, total: number } }>({ data: [], stations: { available: 0, total: 32 } });

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
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
        <div className={`text-3xl font-bold mb-1 ${color.replace('text-', 'text-')}`}>{value}</div>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </CardContent>
    </Card>
  );

  const severityColor = (s) => s === 'CRITICAL' ? 'bg-red-600' : s === 'HIGH' ? 'bg-red-500' : s === 'MEDIUM' ? 'bg-orange-500' : 'bg-yellow-500';
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const parkingData = [
    { name: 'Occupied', value: parking.occupied },
    { name: 'Available', value: parking.available }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">Smart Transport Monitoring Dashboard</h1>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard title="Traffic Incidents" value={stats.incidents} subtitle="Active Alerts" icon={AlertTriangle} color="text-red-600" />
          <StatCard title="Fleet Status" value={stats.fleetOnline} subtitle="Vehicles Online" icon={Car} color="text-green-600" />
          <StatCard title="Train Faults" value={stats.trainFaults} subtitle="Issues Detected" icon={Activity} color="text-orange-600" />
          <StatCard title="EV Chargers" value={`${stats.evUsage}%`} subtitle="In Use" icon={Zap} color="text-blue-600" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* City Map */}
          <Card className="col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />City Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="relative h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden">
                <svg className="absolute inset-0 opacity-20 w-full h-full">
                  <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#64748b" strokeWidth="3" />
                  <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="#64748b" strokeWidth="3" />
                  <line x1="20%" y1="20%" x2="80%" y2="80%" stroke="#64748b" strokeWidth="2" />
                </svg>
                {locations.map((loc, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${((loc.longitude - 103.6) / 0.4) * 100}%`,
                      top: `${((1.47 - loc.latitude) / 0.24) * 100}%`,
                    }}
                  >
                    {loc.sensorType === 'incident' && (
                      <div className="relative group">
                        <AlertTriangle className="h-7 w-7 text-red-600 drop-shadow-lg animate-pulse" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {loc.incidentLocation} - {loc.severity}
                        </div>
                      </div>
                    )}
                    {loc.sensorType === 'fleet' && <Car className="h-6 w-6 text-green-600 drop-shadow-lg" />}
                    {loc.sensorType === 'ev' && <Zap className="h-6 w-6 text-blue-600 drop-shadow-lg" />}
                    {loc.sensorType === 'bus' && <Bus className="h-6 w-6 text-purple-600 drop-shadow-lg" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader><CardTitle>Anomaly Alerts</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents.slice(0, 5).map((inc, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <AlertTriangle className={`h-5 w-5 ${inc.severity === 'CRITICAL' ? 'text-red-600' : inc.severity === 'HIGH' ? 'text-red-500' : 'text-orange-500'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-sm">{inc.incidentLocation || 'Unknown Location'}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${severityColor(inc.severity)}`}>
                          {inc.severity === 'CRITICAL' ? 'Critical' : inc.severity === 'HIGH' ? 'Alert' : 'Warning'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{new Date(inc.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Traffic Congestion */}
          <Card>
            <CardHeader><CardTitle>Traffic Congestion</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={congestion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis hide />
                  <Line type="monotone" dataKey="trafficDensity" stroke="#ef4444" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-sm font-medium text-red-600">High Congestion</span>
              </div>
            </CardContent>
          </Card>

          {/* Predictive Analytics */}
          <Card className="col-span-2">
            <CardHeader><CardTitle>EV Charging Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={evCharging.data}>
                  <Bar dataKey="currentKw" radius={[4, 4, 0, 0]}>
                    {evCharging.data.map((entry: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{evCharging.data[evCharging.data.length - 1]?.currentKw || 0}</div>
                  <div className="text-xs text-slate-500">Current Load (kW)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{evCharging.stations.available}</div>
                  <div className="text-xs text-slate-500">Available Stations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{evCharging.stations.total}</div>
                  <div className="text-xs text-slate-500">Total Stations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Parking */}
          <Card>
            <CardHeader><CardTitle>Parking Availability</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4 relative">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie 
                      data={parkingData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={45} 
                      outerRadius={65} 
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#10b981" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{parking.percentage}%</div>
                    <div className="text-xs text-slate-500">Full</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Available</span><span className="font-bold">{parking.available}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Occupied</span><span className="font-bold">{parking.occupied}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Fleet */}
          <Card>
            <CardHeader><CardTitle>Fleet Monitoring</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center text-center">
                  <span className="text-sm text-slate-600">Avg. Fuel Usage</span>
                  <span className="text-3xl font-bold">{fleet.avgFuelMpg?.toFixed(1) || 0}</span>
                  <span className="text-sm text-slate-500">MPG</span>
                </div>
                <div className="grid grid-cols-3 items-center text-center">
                  <span className="text-sm text-slate-600">Idle Vehicles</span>
                  <span className="text-3xl font-bold">{fleet.idleVehicles || 0}</span>
                  <span className="text-sm text-slate-500">Units</span>
                </div>
                <div className="grid grid-cols-3 items-center text-center">
                  <span className="text-sm text-slate-600">Health Alerts</span>
                  <span className="text-3xl font-bold text-red-600">{fleet.healthAlerts || 0}</span>
                  <span className="text-sm text-slate-500">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incidents Chart */}
          <Card>
            <CardHeader><CardTitle>Incident Trends</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={incidents.slice(0, 7)}>
                  <Bar dataKey="severity" radius={[4, 4, 0, 0]}>
                    {incidents.slice(0, 7).map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.severity === 'CRITICAL' ? '#ef4444' : entry.severity === 'HIGH' ? '#f59e0b' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}