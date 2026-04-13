import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, TrendingUp, TrendingDown, DollarSign, FileText, Download, Filter, Plus, PieChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', amount: 4500 },
  { name: 'Feb', amount: 3200 },
  { name: 'Mar', amount: 5800 },
  { name: 'Apr', amount: 2100 },
  { name: 'May', amount: 4800 },
  { name: 'Jun', amount: 3900 },
];

export default function HealthWallet() {
  const [expenses, setExpenses] = React.useState([
    { id: 1, title: "General Consultation", amount: 1200, category: "Consultation", date: "2026-04-05", status: "Paid" },
    { id: 2, title: "Blood Test - Full Panel", amount: 3500, category: "Lab Test", date: "2026-04-02", status: "Paid" },
    { id: 3, title: "Antibiotics Refill", amount: 850, category: "Medicine", date: "2026-03-28", status: "Paid" },
    { id: 4, title: "Ward Charges - 2 Days", amount: 12000, category: "Hospital Bill", date: "2026-03-15", status: "Paid" },
  ]);

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-6xl font-display font-black tracking-tighter uppercase italic">Health Wallet</h1>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Track medical expenses, bills & insurance claims</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-4 bg-white/5 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 flex items-center gap-3">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3">
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Spent</p>
                <p className="text-3xl font-display font-bold">৳{totalSpent.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Avg Monthly</p>
                <p className="text-3xl font-display font-bold">৳4,200</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500">
                <PieChart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Insurance Cov.</p>
                <p className="text-3xl font-display font-bold">85%</p>
              </div>
            </div>
          </div>

          {/* Spending Chart */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Spending Trends</h3>
              <div className="flex gap-2">
                {['6M', '1Y', 'ALL'].map(t => (
                  <button key={t} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${t === '6M' ? 'bg-white text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Recent Transactions */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Transactions</h3>
              <Filter className="w-5 h-5 text-gray-500 cursor-pointer hover:text-white transition-colors" />
            </div>
            
            <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
              {expenses.map((exp) => (
                <div key={exp.id} className="group p-6 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/5 transition-all duration-500">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">{exp.title}</h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{exp.category} • {exp.date}</p>
                    </div>
                    <p className="text-lg font-display font-bold text-white">৳{exp.amount}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-green-500/20">
                      {exp.status}
                    </span>
                    <button className="text-[8px] font-bold uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      View Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-10 py-5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5 transition-all">
              View All History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
