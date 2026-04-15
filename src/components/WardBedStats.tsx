import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'motion/react';

interface WardStat {
  wardId: string;
  wardName: string;
  wardType: string;
  department: string;
  counts: {
    Available: number;
    Occupied: number;
    Maintenance: number;
  };
}

const COLORS = {
  Available: '#10b981', // Emerald-500
  Occupied: '#ef4444',  // Red-500
  Maintenance: '#f59e0b' // Amber-500
};

const WardBedStats: React.FC = () => {
  const [stats, setStats] = useState<WardStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/wards/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching ward bed stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
        No ward data available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((ward) => {
        const data = [
          { name: 'Available', value: ward.counts.Available },
          { name: 'Occupied', value: ward.counts.Occupied },
          { name: 'Maintenance', value: ward.counts.Maintenance }
        ].filter(item => item.value > 0);

        return (
          <motion.div
            key={ward.wardId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 dark:bg-white/2 p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 backdrop-blur-xl transition-colors duration-500"
          >
            <div className="mb-4">
              <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">{ward.wardName}</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{ward.department} • {ward.wardType}</p>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      borderRadius: '1rem', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number, name: string) => [`${value} Beds`, name]}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tighter">Available</p>
                <p className="text-xl font-display font-bold text-emerald-600 dark:text-emerald-400">{ward.counts.Available}</p>
              </div>
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
                <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-tighter">Occupied</p>
                <p className="text-xl font-display font-bold text-red-600 dark:text-red-400">{ward.counts.Occupied}</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-tighter">Maint.</p>
                <p className="text-xl font-display font-bold text-amber-600 dark:text-amber-400">{ward.counts.Maintenance}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default WardBedStats;
