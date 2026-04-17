import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Users, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function Crowdsourcing() {
  const { token, user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/advanced/campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonate = async (id: string) => {
    const amount = prompt('Enter donation amount (¥):');
    if (!amount || isNaN(Number(amount))) return;

    try {
      const res = await fetch(`/api/advanced/campaigns/${id}/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(amount) })
      });
      if (res.ok) {
        alert('Thank you for your donation!');
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Donation failed', error);
      alert('Donation failed');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900 flex items-center gap-4">
            <Heart className="w-10 h-10 text-red-500" />
            Research & Donations
          </h1>
          <p className="text-gray-500 mt-2">Support groundbreaking medical research and hospital improvements.</p>
        </div>
        <button className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors">
          Start a Campaign
        </button>
      </div>

      {campaigns.length === 0 && !isLoading && (
        <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500 font-medium">No active campaigns found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {campaigns.map((campaign) => (
          <motion.div
            key={campaign._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="h-48 overflow-hidden relative">
              <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-bold text-xl">{campaign.title}</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-red-500">¥{(campaign.raised / 1000).toFixed(0)}k raised</span>
                  <span className="text-gray-500">Goal: ¥{(campaign.goal / 1000).toFixed(0)}k</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-red-500 h-full rounded-full" 
                    style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                  <Users className="w-4 h-4" />
                  {campaign.investors} Backers
                </div>
                <button 
                  onClick={() => handleDonate(campaign._id)}
                  className="text-red-500 font-bold text-sm flex items-center gap-1 hover:text-red-600 transition-colors"
                >
                  Donate <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
