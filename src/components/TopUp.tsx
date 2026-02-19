import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { CreditCard, Check, Shield } from 'lucide-react';

export default function TopUp() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleTopUp = async (amount: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/credits/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        await refreshUser();
        alert('Credits added successfully!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    { price: 10, credits: 100, label: 'Starter' },
    { price: 25, credits: 300, label: 'Pro', popular: true },
    { price: 50, credits: 700, label: 'Business' },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Top Up Credits</h2>
        <p className="text-slate-500">Choose a package that fits your needs. 1 Credit = 1 Request (approx).</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <motion.div 
            key={plan.label}
            whileHover={{ y: -5 }}
            className={`relative bg-white rounded-2xl p-8 border ${plan.popular ? 'border-indigo-500 shadow-xl' : 'border-slate-200 shadow-sm'}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{plan.label}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
              <span className="text-slate-500">USD</span>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Check size={18} className="text-green-500" />
                <span className="font-medium">{plan.credits} Credits</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Shield size={16} />
                <span>Secure Payment</span>
              </div>
            </div>

            <button
              onClick={() => handleTopUp(plan.price)}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-medium transition-colors ${
                plan.popular 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              {loading ? 'Processing...' : 'Purchase Now'}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-slate-50 rounded-2xl p-8 text-center">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Enterprise Needs?</h3>
        <p className="text-slate-500 mb-4">Contact us for custom API quotas and dedicated support.</p>
        <button className="text-indigo-600 font-medium hover:underline">Contact Sales</button>
      </div>
    </div>
  );
}
