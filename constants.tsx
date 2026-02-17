
import React from 'react';
import { PricingTier } from './types';

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'gal_lite',
    name: 'Galvaniy Lite',
    price: 2500,
    tokens: '1M Tokens',
    features: ['Access to 1.5 Flash', 'Standard Latency', 'Email Support', 'Basic Analytics'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'gal_pro',
    name: 'Galvaniy Pro',
    price: 5000,
    tokens: '10M Tokens',
    features: ['Access to 1.5 Pro', 'Low Latency', 'Priority Support', 'Advanced Usage Insights', 'Fine-tuning Access'],
    popular: true,
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'gal_ultra',
    name: 'Galvaniy Ultra',
    price: 15000,
    tokens: 'Unlimited*',
    features: ['Custom Model Deployment', 'Zero Latency Pipeline', 'Dedicated Key Manager', 'SLA Guarantees', 'On-premise Options'],
    color: 'from-amber-500 to-orange-600'
  }
];

export const M_PESA_LOGO = (
  <svg viewBox="0 0 100 100" className="w-12 h-12">
    <rect width="100" height="100" rx="15" fill="#4fb233" />
    <path d="M20 30 L40 70 L60 30 L80 70" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
