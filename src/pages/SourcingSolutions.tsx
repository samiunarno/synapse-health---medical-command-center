import React from 'react';
import { motion } from 'motion/react';
import { 
  Globe, 
  Search, 
  ShieldCheck, 
  Truck, 
  Building2, 
  Package, 
  BarChart3, 
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function SourcingSolutions() {
  const solutions = [
    {
      title: "Global Medical Sourcing",
      desc: "Direct access to certified manufacturers worldwide, eliminating middlemen and reducing costs.",
      icon: Globe,
      features: ["Verified Suppliers", "Quality Assurance", "Direct Logistics"]
    },
    {
      title: "Bulk Procurement",
      desc: "Scalable sourcing solutions for hospitals and large medical groups with volume-based pricing.",
      icon: Package,
      features: ["Volume Discounts", "Inventory Management", "Scheduled Deliveries"]
    },
    {
      title: "Equipment Leasing",
      desc: "Flexible financing and leasing options for high-end medical machinery and diagnostic tools.",
      icon: Building2,
      features: ["Flexible Terms", "Maintenance Included", "Upgrade Paths"]
    },
    {
      title: "Supply Chain Analytics",
      desc: "Real-time tracking and predictive analytics to optimize your medical supply chain.",
      icon: BarChart3,
      features: ["Real-time Tracking", "Demand Forecasting", "Cost Analysis"]
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden rounded-[3rem] bg-white/5 border border-white/10">
        <div className="absolute inset-0 bg-mesh opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 text-blue-400"
          >
            <Globe className="w-3 h-3" />
            Global Trade Protocol v4.0
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-display font-black uppercase tracking-tighter leading-none mb-8"
          >
            Sourcing <span className="text-blue-500">Solutions</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg uppercase tracking-widest leading-relaxed max-w-2xl mx-auto"
          >
            Revolutionizing medical procurement through direct global connections and AI-driven logistics.
          </motion.p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {solutions.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-12 bg-white/2 border border-white/5 rounded-[3rem] hover:bg-white/5 transition-all group"
          >
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 mb-8 group-hover:scale-110 transition-transform">
              <item.icon className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-display font-bold uppercase tracking-tighter mb-4">{item.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 uppercase tracking-widest">{item.desc}</p>
            <ul className="space-y-3">
              {item.features.map(feature => (
                <li key={feature} className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </section>

      {/* Process Section */}
      <section className="bg-blue-600 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-4xl lg:text-6xl font-display font-black uppercase tracking-tighter leading-none">
              Streamlined <br />Procurement
            </h2>
            <p className="text-blue-100 text-sm uppercase tracking-widest leading-relaxed">
              Our automated system handles everything from verification to customs clearance, ensuring your supplies arrive on time and within budget.
            </p>
            <button className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-50 transition-all shadow-2xl">
              Start Sourcing
            </button>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
            {[
              { label: 'Verified Suppliers', value: '5,000+' },
              { label: 'Countries Covered', value: '120+' },
              { label: 'Avg. Cost Saving', value: '35%' },
              { label: 'Delivery Success', value: '99.9%' }
            ].map(stat => (
              <div key={stat.label} className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
                <p className="text-3xl font-display font-black mb-1">{stat.value}</p>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </section>
    </div>
  );
}
