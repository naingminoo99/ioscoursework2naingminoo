"use client";

import { useState } from 'react';
import { AlertTriangle, Car, Activity, Zap, MapPin, Bus, BarChart3, Navigation, Wrench, Bell } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function Dashboard() {
  const [stats] = useState({ incidents: 5, fleetOnline: 128, trainFaults: 2, evUsage: 85 });
  const [incidents] = useState([
    { location: 'Accident on Main St.', severity: 'CRITICAL', time: '13:34 PM' },
    { location: 'Bus Overcrowded', severity: 'MEDIUM', time: '11:07 AM' },
    { location: 'Train Signal Fault', severity: 'HIGH', time: '11:03 AM' }
  ]);
  
  const congestionData = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    level: 40 + Math.sin(i * 0.5) * 20 + Math.random() * 10
  }));

  const predictiveData = [
    { name: 'Mon', breakdowns: 8, delays: 5, highLoad: 12 },
    { name: 'Tue', breakdowns: 12, delays: 8, highLoad: 15 },
    { name: 'Wed', breakdowns: 6, delays: 4, highLoad: 10 },
    { name: 'Thu', breakdowns: 10, delays: 6, highLoad: 13 },
    { name: 'Fri', breakdowns: 15, delays: 10, highLoad: 18 },
    { name: 'Sat', breakdowns: 5, delays: 3, highLoad: 8 },
    { name: 'Sun', breakdowns: 4, delays: 2, highLoad: 6 }
  ];

  const incidentForecast = [
    { day: 'Mon', incidents: 8 },
    { day: 'Tue', incidents: 6 },
    { day: 'Wed', incidents: 12 },
    { day: 'Thu', incidents: 15 },
    { day: 'Fri', incidents: 10 },
    { day: 'Sat', incidents: 8 },
    { day: 'Sun', incidents: 14 }
  ];

  const evChargingData = Array.from({ length: 12 }, (_, i) => ({
    time: i,
    load: 250 + Math.random() * 150
  }));

  const parkingData = [
    { name: 'Occupied', value: 145, color: '#3b82f6' },
    { name: 'Available', value: 54, color: '#10b981' }
  ];

  const Card = ({ children, span }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      overflow: 'hidden',
      gridColumn: span ? `span ${span}` : 'span 1'
    }}>
      {children}
    </div>
  );

  const CardHeader = ({ children, border }) => (
    <div style={{
      padding: '1.5rem',
      borderBottom: border ? '1px solid #e2e8f0' : 'none'
    }}>
      {children}
    </div>
  );

  const CardContent = ({ children }) => (
    <div style={{ padding: '1.5rem' }}>
      {children}
    </div>
  );

  const StatCard = ({ title, value, subtitle, icon: Icon, bgColor, iconColor }) => (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569', marginBottom: '0.25rem' }}>{title}</p>
            <p style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>{value}</p>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</p>
          </div>
          <div style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            backgroundColor: bgColor
          }}>
            <Icon style={{ height: '2rem', width: '2rem', color: iconColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f1f5f9, #dbeafe, #f1f5f9)',
      padding: '1.5rem'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '2rem' }}>
          Smart Transport Monitoring Dashboard
        </h1>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <StatCard 
            title="Traffic Incidents" 
            value={stats.incidents} 
            subtitle="Active Alerts" 
            icon={AlertTriangle} 
            bgColor="#fee2e2"
            iconColor="#dc2626"
          />
          <StatCard 
            title="Fleet Status" 
            value={stats.fleetOnline} 
            subtitle="Vehicles Online" 
            icon={Car} 
            bgColor="#dcfce7"
            iconColor="#16a34a"
          />
          <StatCard 
            title="Train Faults" 
            value={stats.trainFaults} 
            subtitle="Issues Detected" 
            icon={Activity} 
            bgColor="#ffedd5"
            iconColor="#ea580c"
          />
          <StatCard 
            title="EV Chargers" 
            value={`${stats.evUsage}%`} 
            subtitle="In Use" 
            icon={Zap} 
            bgColor="#dbeafe"
            iconColor="#2563eb"
          />
        </div>

        {/* Main Grid - City Overview and Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* City Map */}
          <Card span={2}>
            <CardHeader border>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                <MapPin style={{ height: '1.25rem', width: '1.25rem' }} />
                City Overview
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ 
                position: 'relative', 
                height: '16rem', 
                background: 'linear-gradient(to bottom right, #dbeafe, #eff6ff, #dcfce7)',
                borderRadius: '0.75rem',
                border: '2px solid #93c5fd',
                overflow: 'hidden'
              }}>
                {/* Street Grid */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }}>
                  <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#94a3b8" strokeWidth="2" />
                </svg>
                
                {/* Map Icons */}
                <div style={{ position: 'absolute', left: '35%', top: '25%' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      inset: '-0.5rem', 
                      backgroundColor: '#ef4444', 
                      borderRadius: '9999px', 
                      opacity: 0.2,
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}></div>
                    <AlertTriangle style={{ height: '2rem', width: '2rem', color: '#dc2626', filter: 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))', position: 'relative', zIndex: 10 }} />
                  </div>
                </div>
                
                <div style={{ position: 'absolute', left: '60%', top: '35%' }}>
                  <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <Bus style={{ height: '1.5rem', width: '1.5rem', color: '#16a34a' }} />
                  </div>
                </div>
                
                <div style={{ position: 'absolute', left: '25%', top: '55%' }}>
                  <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <Activity style={{ height: '1.5rem', width: '1.5rem', color: '#ea580c' }} />
                  </div>
                </div>
                
                <div style={{ position: 'absolute', left: '45%', top: '60%' }}>
                  <div style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: '700', fontSize: '1.125rem' }}>
                    P
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anomaly Alerts */}
          <Card>
            <CardHeader border>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>Anomaly Alerts</div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {incidents.map((inc, i) => (
                  <div key={i} style={{ borderLeft: '4px solid #ef4444', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0 0.5rem 0.5rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <AlertTriangle style={{ 
                        height: '1.25rem', 
                        width: '1.25rem', 
                        marginTop: '0.125rem',
                        color: inc.severity === 'CRITICAL' ? '#dc2626' : inc.severity === 'HIGH' ? '#ef4444' : '#f97316'
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                          <p style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1e293b' }}>{inc.location}</p>
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: inc.severity === 'CRITICAL' ? '#dc2626' : inc.severity === 'HIGH' ? '#ef4444' : '#f97316',
                            color: 'white'
                          }}>
                            {inc.severity === 'CRITICAL' ? 'Critical' : inc.severity === 'HIGH' ? 'Alert' : 'Warning'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{inc.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Analytics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Traffic Congestion */}
          <Card>
            <CardHeader border>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>Traffic Congestion</div>
            </CardHeader>
            <CardContent>
              <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>Congestion Level</p>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={congestionData}>
                  <defs>
                    <linearGradient id="congestionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="level" stroke="#ef4444" strokeWidth={3} fill="url(#congestionGradient)" />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', backgroundColor: '#dc2626', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626' }}>High Congestion</span>
              </div>
            </CardContent>
          </Card>

          {/* Predictive Analytics */}
          <Card span={2}>
            <CardHeader border>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>Predictive Analytics</div>
                  <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem' }}>Incident Forecast</p>
                </div>
                <BarChart3 style={{ height: '1.25rem', width: '1.25rem', color: '#94a3b8' }} />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={predictiveData}>
                  <Bar dataKey="breakdowns" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delays" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="highLoad" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b' }}>12</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Breakdowns</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b' }}>8</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Delays</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b' }}>15</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>High Load</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Parking */}
          <Card>
            <CardHeader border>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>Parking Availability</div>
            </CardHeader>
            <CardContent>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie 
                      data={parkingData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={50} 
                      outerRadius={70} 
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {parkingData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b' }}>73%</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Full</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#475569' }}>Available</span>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>54</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#475569' }}>Occupied</span>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>145</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fleet Monitoring */}
          <Card>
            <CardHeader border>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>Fleet Monitoring</div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>Avg. Fuel Usage</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b' }}>22.8</span>
                    <span style={{ fontSize: '1.125rem', color: '#64748b' }}>MPG</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>Idle Vehicles</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b' }}>18</span>
                    <span style={{ fontSize: '1.125rem', color: '#64748b' }}>Units</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>Health Alerts</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2.25rem', fontWeight: '700', color: '#dc2626' }}>5</span>
                    <span style={{ fontSize: '1.125rem', color: '#64748b' }}>Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Predictive Analytics - Incident Forecast */}
          <Card>
            <CardHeader border>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>Predictive Analytics</div>
              <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem' }}>Incident Forecast</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={incidentForecast}>
                  <Bar dataKey="incidents" radius={[4, 4, 0, 0]}>
                    {incidentForecast.map((entry, i) => (
                      <Cell key={i} fill={i === 3 ? '#ef4444' : i === 4 ? '#f59e0b' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* EV Charging and Operations */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <Card span={2}>
            <CardHeader border>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>EV Charging Status</div>
            </CardHeader>
            <CardContent>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>Current Load</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b' }}>320</span>
                  <span style={{ fontSize: '1.125rem', color: '#64748b' }}>kW</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={evChargingData}>
                  <Bar dataKey="load" radius={[4, 4, 0, 0]}>
                    {evChargingData.map((entry, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#475569' }}>Stations Available</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1e293b' }}>8 / 32</span>
              </div>
              <div style={{ marginTop: '0.5rem', height: '0.5rem', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', backgroundColor: '#3b82f6', borderRadius: '9999px', width: '25%' }}></div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Actions */}
          <Card>
            <CardHeader border>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>Operational Actions</div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}>
                  <Navigation style={{ height: '1rem', width: '1rem' }} />
                  Reroute Traffic
                </button>
                <button style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#475569',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}>
                  <Wrench style={{ height: '1rem', width: '1rem' }} />
                  Dispatch Maintenance
                </button>
                <button style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}>
                  <Bell style={{ height: '1rem', width: '1rem' }} />
                  Send Alert
                </button>
                <button style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#334155',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}>
                  <BarChart3 style={{ height: '1rem', width: '1rem' }} />
                  View Reports
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
}