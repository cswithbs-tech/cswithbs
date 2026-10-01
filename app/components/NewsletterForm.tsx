'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { useToast } from '@/app/context/ToastContext';

interface NewsletterFormProps {
  initialEmail?: string;
  isSubscribed?: boolean;
  variant?: 'default' | 'sidebar';
}

export const NewsletterForm = ({ initialEmail = '', isSubscribed = false, variant = 'default' }: NewsletterFormProps) => {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showToast(data.message, 'success');
        setEmail('');
      } else {
        showToast(data.error || 'Something went wrong', 'error');
      }
    } catch (error) {
       showToast('Network error. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
  };

  if (variant === 'sidebar') {
    return (
      <div className="w-full flex flex-col items-center">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full relative">
          <input
            type="email"
            placeholder="your@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent focus:bg-white/10 w-full transition-all outline-none placeholder:text-zinc-500"
          />
          <button 
            type="submit" 
            disabled={loading || isSubscribed}
            className="bg-accent text-black w-full px-4 py-3 rounded-xl font-bold text-sm hover:bg-accent/90 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : isSubscribed ? 'Subscribed' : 'Subscribe Free'}
          </button>
        </form>
        {isSubscribed && (
             <p className="mt-3 text-xs text-green-500 font-medium">You are already subscribed.</p>
        )}
      </div>
    );
  }

  return (
        <div className="w-full flex flex-col items-center">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full relative">
                <input 
                    type="email" 
                    placeholder="Enter your email address..." 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent border border-white/10 rounded p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent transition-colors" 
                />
                <Button className="w-full sm:w-auto px-6 whitespace-nowrap" disabled={loading || isSubscribed}>
                    {loading ? 'Joining...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
            </form>
            {isSubscribed && (
                 <p className="mt-2 text-xs text-green-500 font-medium">You are already subscribed to our newsletter.</p>
            )}
        </div>
  );
};
