import React, { useState } from 'react';
import { motion } from 'motion/react';
import QRCodePaymentModal from '../components/QRCodePaymentModal';
import { 
  Shield, 
  Zap, 
  Star, 
  Users, 
  CreditCard, 
  CheckCircle2,
  Crown,
  Building,
  Heart,
  ArrowRight
} from 'lucide-react';

export default function ServicesMembership() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);

  const handleSubscribe = (planName: string, priceString: string) => {
    if (priceString === '$0' || priceString === 'Custom') {
      return;
    }
    const price = parseInt(priceString.replace(/[^0-9]/g, ''));
    setSelectedPlan({ name: planName, price });
    setIsPaymentModalOpen(true);
  };
  const plans = [
    {
      name: "Standard",
      price: "$0",
      period: "/month",
      desc: "Essential features for individual practitioners and small clinics.",
      icon: Users,
      features: ["Basic EHR Access", "TeleHealth (Limited)", "Public Marketplace", "Email Support"],
      color: "blue"
    },
    {
      name: "Professional",
      price: "$199",
      period: "/month",
      desc: "Advanced tools for growing medical practices and specialized centers.",
      icon: Zap,
      features: ["Full EHR Suite", "Unlimited TeleHealth", "Priority Sourcing", "AI Diagnostics (Basic)", "24/7 Support"],
      color: "purple",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "Full-scale solutions for hospitals and international medical networks.",
      icon: Crown,
      features: ["Custom Integration", "Dedicated Account Manager", "Global Sourcing Network", "Advanced AI Hub", "On-site Training"],
      color: "emerald"
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 text-purple-400"
          >
            <Star className="w-3 h-3" />
            Membership Program v2.1
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-display font-black uppercase tracking-tighter leading-none mb-8"
          >
            Services & <span className="text-purple-500">Membership</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg uppercase tracking-widest leading-relaxed max-w-2xl mx-auto"
          >
            Choose the right tier for your medical practice and unlock the full potential of the Synapse ecosystem.
          </motion.p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-12 rounded-[3rem] border transition-all duration-500 group ${
              plan.popular 
                ? 'bg-purple-600 border-purple-500 text-white shadow-2xl shadow-purple-500/20 scale-105 z-10' 
                : 'bg-white/2 border-white/5 text-white hover:bg-white/5'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-8 right-8 px-4 py-1 bg-white text-purple-600 rounded-full text-[8px] font-bold uppercase tracking-widest">
                Most Popular
              </div>
            )}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${
              plan.popular ? 'bg-white/20' : 'bg-purple-600/20 text-purple-500'
            }`}>
              <plan.icon className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-display font-bold uppercase tracking-tighter mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-display font-black tracking-tighter">{plan.price}</span>
              <span className={`text-sm font-bold uppercase tracking-widest ${plan.popular ? 'text-purple-200' : 'text-gray-500'}`}>
                {plan.period}
              </span>
            </div>
            <p className={`text-sm leading-relaxed mb-12 uppercase tracking-widest ${plan.popular ? 'text-purple-100' : 'text-gray-500'}`}>
              {plan.desc}
            </p>
            <ul className="space-y-4 mb-12">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                  <CheckCircle2 className={`w-4 h-4 ${plan.popular ? 'text-white' : 'text-purple-500'}`} />
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleSubscribe(plan.name, plan.price)}
              className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
              plan.popular 
                ? 'bg-white text-purple-600 hover:bg-purple-50' 
                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            }`}>
              Get Started
            </button>
          </motion.div>
        ))}
      </section>

      {/* Additional Services */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-12 bg-white/2 border border-white/5 rounded-[3rem] flex flex-col justify-between">
          <div>
            <Building className="w-12 h-12 text-blue-500 mb-8" />
            <h3 className="text-3xl font-display font-bold uppercase tracking-tighter mb-4">Clinic Setup</h3>
            <p className="text-gray-500 text-sm leading-relaxed uppercase tracking-widest">
              Full architectural and technical consultancy for setting up new medical facilities with integrated Synapse technology.
            </p>
          </div>
          <button className="mt-12 flex items-center gap-2 text-blue-500 font-bold uppercase tracking-widest text-[10px] group">
            Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
        <div className="p-12 bg-white/2 border border-white/5 rounded-[3rem] flex flex-col justify-between">
          <div>
            <Heart className="w-12 h-12 text-red-500 mb-8" />
            <h3 className="text-3xl font-display font-bold uppercase tracking-tighter mb-4">Patient Care Plus</h3>
            <p className="text-gray-500 text-sm leading-relaxed uppercase tracking-widest">
              Premium support services for patients, including dedicated health coaches and priority access to specialists.
            </p>
          </div>
          <button className="mt-12 flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-[10px] group">
            Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>
      <QRCodePaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        amount={selectedPlan?.price}
        planName={selectedPlan?.name}
      />
    </div>
  );
}
