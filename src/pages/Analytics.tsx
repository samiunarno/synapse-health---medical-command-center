import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  DollarSign, 
  Ambulance, 
  Pill, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { motion } from 'motion/react';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function Analytics() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [statsRes, trendsRes] = await Promise.all([
        fetch('/api/analytics/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/analytics/inpatient-trends', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const stats = await statsRes.json();
      const trends = await trendsRes.json();

      // Aggregate some stats
      setData({
        stats: [
          { label: 'Total Patients', value: stats.totalPatients.toLocaleString(), change: '+12%', trend: 'up', icon: Users, color: 'blue' },
          { label: 'Active Ambulances', value: stats.ambulanceCount, change: '+2', trend: 'up', icon: Ambulance, color: 'red' },
          { label: 'Medicine Orders', value: stats.medicineOrderCount, change: '+18%', trend: 'up', icon: Pill, color: 'green' },
          { label: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, change: '-3%', trend: 'down', icon: DollarSign, color: 'yellow' },
        ],
        revenueData: [
          { name: 'Jan', revenue: 4000, orders: 240 },
          { name: 'Feb', revenue: 3000, orders: 198 },
          { name: 'Mar', revenue: 2000, orders: 980 },
          { name: 'Apr', revenue: 2780, orders: 390 },
          { name: 'May', revenue: 1890, orders: 480 },
          { name: 'Jun', revenue: 2390, orders: 380 },
        ],
        serviceDistribution: stats.serviceDistribution,
        patientGrowth: trends.map((t: any) => ({ day: t.month, count: t.count }))
      });
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96 text-white">Loading Analytics...</div>;

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white flex items-center gap-4">
          <TrendingUp className="w-8 h-8 text-indigo-500" />
          Real-Time Analytics
        </h1>
        <p className="text-gray-500 font-medium">Hospital performance and service utilization metrics</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.stats.map((stat: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/2 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 bg-${stat.color}-500`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-display font-bold text-white">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue & Orders Chart */}
        <div className="bg-white/2 border border-white/5 p-8 rounded-[2.5rem]">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-yellow-500" />
            Revenue & Orders Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Growth */}
        <div className="bg-white/2 border border-white/5 p-8 rounded-[2.5rem]">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <Activity className="w-5 h-5 text-red-500" />
            Weekly Patient Inflow
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.patientGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="day" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Distribution */}
        <div className="bg-white/2 border border-white/5 p-8 rounded-[2.5rem]">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-green-500" />
            Service Utilization
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.serviceDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Requests Summary */}
        <div className="bg-white/2 border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-center">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">System Health</h3>
              <span className="flex items-center gap-2 text-green-500 text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                Operational
              </span>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Server Response', value: '42ms', status: 'optimal' },
                { label: 'Database Sync', value: 'Real-time', status: 'optimal' },
                { label: 'Active Sockets', value: '124', status: 'optimal' },
                { label: 'API Uptime', value: '99.9%', status: 'optimal' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-gray-400 text-sm font-medium">{item.label}</span>
                  <span className="text-white font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
