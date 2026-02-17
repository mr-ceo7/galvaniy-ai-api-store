import React, { useState, useEffect } from 'react';
import { PricingTier } from '../types';
import { initiateMpesaStkPush } from '../services/lipanaService';
import { generateReceipt } from '../services/receiptService';

interface PaymentModalProps {
  tier: PricingTier;
  onClose: () => void;
  onSuccess: (apiKey: string) => void;
}

type Step = 'form' | 'waiting' | 'generating' | 'final-confirmation';

const PAYMENT_BACKEND_URL = import.meta.env.VITE_PAYMENT_BACKEND_URL || 'http://localhost:3000';

const PaymentModal: React.FC<PaymentModalProps> = ({ tier, onClose, onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [step, setStep] = useState<Step>('form');

  // Poll for payment confirmation
  useEffect(() => {
    let poll: number | undefined;
    if (transactionId && !paymentConfirmed) {
      poll = window.setInterval(async () => {
        try {
          const r = await fetch(`${PAYMENT_BACKEND_URL}/api/transaction-status/${transactionId}`);
          if (!r.ok) return;
          const j = await r.json();
          if (j.status === 'COMPLETED') {
            setPaymentConfirmed(true);
            setLoading(false);
            setStep('waiting');
            if (poll) clearInterval(poll);
          } else if (j.status === 'FAILED') {
            setError('Payment failed');
            setLoading(false);
            setStep('form');
            if (poll) clearInterval(poll);
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    }
    return () => { if (poll) clearInterval(poll); };
  }, [transactionId, paymentConfirmed]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Get or create a persistent User ID (simulated authentication for guests)
    let uid = localStorage.getItem('galvaniy_uid');
    if (!uid) {
      uid = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('galvaniy_uid', uid);
    }

    console.log("Sending Payment Request:", { phone, planId: tier.id, uid });


    try {
      const res = await initiateMpesaStkPush(phone, tier.id, uid);
      
      // Support multiple response formats from backend/Lipana
      const txn = res?.transactionId || res?.data?.transactionId || (res as any)?.id;
      
      if (!txn) {
        console.error('Payment response missing transactionId:', res);
        throw new Error('Failed to start payment: No transaction ID returned');
      }
      
      setTransactionId(txn);
      setStep('waiting');
    } catch (err: any) {
      console.error('Payment Error:', err);
      setError(err?.message || 'Payment processing failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!transactionId) return setError('No transaction id');
    setStep('generating');
    try {
      const r = await fetch(`${PAYMENT_BACKEND_URL}/api/transaction/${transactionId}/api-key`);
      if (!r.ok) throw new Error('Failed to get API key');
      const j = await r.json();
      setStep('final-confirmation');
      
      // Auto-download receipt? Or let user click.
      // Let user click.
      
      setTimeout(() => onSuccess(j.key), 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch key');
      setStep('waiting');
    }
  };

  const handleDownloadReceipt = () => {
    if (!transactionId) return;
    generateReceipt({
      transactionId,
      date: new Date().toLocaleString(),
      amount: tier.price,
      paymentMethod: 'M-Pesa',
      planName: tier.name,
      phone: phone,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 z-50">
      <div className="bg-slate-950 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Gradient glow */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${tier.color} opacity-20 blur-3xl rounded-full pointer-events-none`} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Buy {tier.name}</h3>
            <p className="text-sm text-slate-400">{tier.tokens} tokens</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handlePayment} className="space-y-5">
            {/* Price */}
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
              <span className="text-xl font-bold text-white">KES {tier.price.toLocaleString()}</span>
            </div>

            {/* Phone input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 block">M-Pesa Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">+254</span>
                <input
                  type="tel"
                  placeholder="712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-14 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  required
                />
              </div>
              <p className="text-xs text-slate-500">Enter the number that will receive the M-Pesa prompt.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Pay button */}
            <button
              type="submit"
              disabled={loading || phone.length < 9}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 flex items-center justify-center space-x-2 ${
                loading || phone.length < 9
                ? 'bg-slate-800 cursor-not-allowed'
                : `bg-gradient-to-r ${tier.color} shadow-lg shadow-purple-500/20 hover:brightness-110`
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Pay with M-Pesa</span>
              )}
            </button>

            {/* Security badge */}
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secured by Lipana Pay</span>
            </div>
          </form>
        ) : step === 'generating' ? (
          <div className="text-center py-12 space-y-8">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-purple-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`absolute top-0 left-0 h-full bg-gradient-to-r ${tier.color} animate-[loading-bar_2s_ease-in-out_infinite]`}></div>
              </div>
              <p className="text-slate-400 text-sm italic">Assigning tier permissions and generating credentials...</p>
            </div>
            <style>{`
              @keyframes loading-bar {
                0% { width: 0%; left: 0%; }
                50% { width: 100%; left: 0%; }
                100% { width: 0%; left: 100%; }
              }
            `}</style>
          </div>
        ) : step === 'final-confirmation' ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/40">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-white">Success!</h4>
            <p className="text-slate-400">Redirecting to your key dashboard...</p>
          </div>
        ) : (
          /* step === 'waiting' */
          <div className="text-center py-12 space-y-6">
            {paymentConfirmed ? (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-bold text-white">Payment Confirmed!</h4>
                  <p className="text-slate-400">Transaction verified. Your API key is ready.</p>
                </div>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleGenerateKey}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 bg-gradient-to-r ${tier.color} shadow-lg shadow-purple-500/20 hover:brightness-110`}
                >
                  Generate Key
                </button>
                
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full py-3 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Receipt</span>
                </button>
              </div>
            ) : (
              <>
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-[#4fb233] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">M</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white">Waiting for Payment...</h4>
                  <p className="text-slate-400">Check your phone for the M-Pesa STK prompt and enter your PIN.</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl text-xs text-slate-500 font-mono break-all animate-pulse">
                  ID: {transactionId || '...'}
                </div>
                <p className="text-xs text-slate-600">Do not close this window until the process completes.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
