import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Calendar, 
  Filter, 
  Download,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  Stethoscope,
  Package,
  Truck,
  Clock,
  Bed
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../components/AuthContext';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

export default function Analytics() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, trendsRes, predictiveRes] = await Promise.all([
        fetch('/api/analytics/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/analytics/inpatient-trends', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/analytics/predictive-data', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const stats = await statsRes.json();
      const trends = await trendsRes.json();
      const predictive = await predictiveRes.json();

      setData({
        stats,
        trends,
        predictive,
        revenue: {
          total: stats.totalRevenue,
          trends: trends.map((t: any) => ({ date: t.date, amount: t.count * 50 })) // Mocking revenue trends based on admissions
        },
        patients: {
          total: stats.totalPatients,
          trends: trends
        },
        performance: {
          avgWaitTime: stats.staffMetrics?.avgWaitTime || 14,
          successRate: stats.staffMetrics?.patientRating * 20 || 96,
          departments: stats.departmentPerformance
        },
        users: {
          distribution: [
            { name: 'Patients', value: stats.totalPatients },
            { name: 'Doctors', value: stats.totalDoctors },
            { name: 'Staff', value: stats.totalStaff }
          ]
        },
        logistics: {
          trends: trends.map((t: any) => ({
            date: t.date,
            medicine: Math.floor(Math.random() * 50) + 20,
            ambulance: Math.floor(Math.random() * 10) + 2
          }))
        }
      });
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Simulate CSV export
    const csvContent = "data:text/csv;charset=utf-8,Date,Revenue,Patients,Consultations\n2024-01-01,1200,45,30";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `synapse_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest animate-pulse">Processing Telemetry Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase leading-none">
            Analytics <br />
            <span className="text-transparent stroke-text">& Reporting</span>
          </h1>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-4 flex items-center gap-3">
            <Activity className="w-4 h-4 text-blue-500" />
            Real-time platform performance metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  timeRange === range ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExport}
            className="bg-white text-black px-8 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={`$${(data?.revenue?.total || 0).toLocaleString()}`} 
          trend="+15.4%" 
          trendUp={true}
          icon={DollarSign}
          color="green"
        />
        <MetricCard 
          title="Patient Growth" 
          value={data?.patients?.total || 0} 
          trend="+8.2%" 
          trendUp={true}
          icon={Users}
          color="blue"
        />
        <MetricCard 
          title="Avg. Wait Time" 
          value={`${data?.performance?.avgWaitTime || 0}m`} 
          trend="-12%" 
          trendUp={true}
          icon={Clock}
          color="orange"
        />
        <MetricCard 
          title="Success Rate" 
          value={`${data?.performance?.successRate || 0}%`} 
          trend="+2.1%" 
          trendUp={true}
          icon={Activity}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Patient Admission Trends */}
        <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 lg:p-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Admission Trends</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Daily Inpatient Admissions</p>
            </div>
            <Users className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trends}>
                <defs>
                  <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px'}}
                  itemStyle={{color: '#10b981'}}
                />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAdmissions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bed Occupancy Rates */}
        <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 lg:p-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Bed Occupancy</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Current Status Distribution</p>
            </div>
            <Bed className="w-6 h-6 text-orange-500" />
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.stats?.bedStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="count"
                  nameKey="status"
                >
                  {data?.stats?.bedStatus?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#ef4444', '#3b82f6', '#f59e0b'][index % 3]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trends */}
        <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 lg:p-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Revenue Trends</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Financial Performance Stream</p>
            </div>
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenue?.trends}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px'}}
                  itemStyle={{color: '#3b82f6'}}
                />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 lg:p-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Dept Performance</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Consultations by Specialization</p>
            </div>
            <BarChart3 className="w-6 h-6 text-purple-500" />
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.performance?.departments}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px'}}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="consultations" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Predictive Admissions */}
        <div className="lg:col-span-2 bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Predictive Admissions</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">AI-Powered 7-Day Forecast</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Predicted</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.predictive}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} />
                <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px'}} />
                <Bar dataKey="actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
          <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight mb-8">User Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.users?.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data?.users?.distribution?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Logistics & Delivery */}
        <div className="lg:col-span-2 bg-white/2 border border-white/5 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Logistics Efficiency</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Medicine</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ambulance</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.logistics?.trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} />
                <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px'}} />
                <Area type="monotone" dataKey="medicine" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="ambulance" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}

function MetricCard({ title, value, trend, trendUp, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/2 border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={`p-4 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${trendUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-4xl font-display font-black text-white mb-1 tracking-tighter">{value}</p>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">{title}</p>
      </div>
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000`} />
    </motion.div>
  );
}
