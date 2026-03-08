import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchInvoice, payInvoice, generateInvoicePDF, Invoice } from '../services/invoiceService';
import { generateReceipt } from '../services/receiptService';

const PAYMENT_BACKEND_URL = import.meta.env.VITE_PAYMENT_BACKEND_URL || 'https://uon-smart-backend.onrender.com';

const InvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [payStep, setPayStep] = useState<'idle' | 'input' | 'sending' | 'waiting' | 'paid'>('idle');
  const [payError, setPayError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  // PDF Preview State
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchInvoice(id)
      .then(inv => { setInvoice(inv); setLoading(false); })
      .catch(() => { setError('Invoice not found'); setLoading(false); });
  }, [id]);

  // Poll for payment status
  useEffect(() => {
    if (payStep !== 'waiting' || !transactionId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${PAYMENT_BACKEND_URL}/api/transaction-status/${transactionId}`);
        const data = await res.json();
        if (data.status === 'COMPLETED') {
          setPayStep('paid');
          setInvoice(prev => prev ? { ...prev, status: 'PAID', paidAt: new Date().toISOString() } : prev);
          clearInterval(interval);
        } else if (data.status === 'FAILED') {
          setPayError('Payment failed. Please try again.');
          setPayStep('input');
          clearInterval(interval);
        }
      } catch { /* continue polling */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [payStep, transactionId]);

  const handlePay = async () => {
    if (!phone || !invoice) return;
    setPayStep('sending');
    setPayError('');
    try {
      const result = await payInvoice(invoice.id, phone);
      setTransactionId(result.transactionId);
      setPayStep('waiting');
    } catch (err: any) {
      setPayError(err.message || 'Payment failed');
      setPayStep('input');
    }
  };

  const handleDownload = async () => {
    if (!invoice) return;
    await generateInvoicePDF(invoice);
  };

  const handleDownloadReceipt = async () => {
    if (!invoice) return;
    
    // Map invoice data to receipt data structure
    const receiptData = {
      transactionId: invoice.transactionId || transactionId || `TXN_${Date.now()}`,
      date: new Date().toLocaleDateString(),
      planName: `Invoice ${invoice.invoiceNumber}`,
      amount: invoice.total,
      paymentMethod: 'M-Pesa',
      phone: invoice.clientPhone || phone || 'N/A'
    };
    
    // Generate and download
    await generateReceipt(receiptData);
  };

  const handlePreviewReceipt = async () => {
    if (!invoice) return;
    setShowPreview(true);
    setPreviewPdfUrl(null);
    
    const receiptData = {
      transactionId: invoice.transactionId || transactionId || `TXN_${Date.now()}`,
      date: new Date().toLocaleDateString(),
      planName: `Invoice ${invoice.invoiceNumber}`,
      amount: invoice.total,
      paymentMethod: 'M-Pesa',
      phone: invoice.clientPhone || phone || 'N/A'
    };
    
    const doc = await generateReceipt(receiptData, true);
    if (doc) {
      setPreviewPdfUrl(doc.output('datauristring'));
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-white mb-2">Invoice Not Found</h2>
          <p className="text-slate-400">This invoice link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'PAID' || payStep === 'paid';
  const statusColors: Record<string, string> = {
    UNPAID: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    OVERDUE: 'bg-red-500/20 text-red-400 border-red-500/30',
    CANCELLED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    PROCESSING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 print:bg-white print:py-0">

      {/* Invoice Card */}
      <div className="max-w-3xl mx-auto">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-2xl p-6 border border-white/10 border-b-0 flex items-center justify-between print:bg-slate-900">
          <div className="flex items-center space-x-4">
            <img src="/galvaniy-logo.jpg" alt="Galvaniy" className="w-12 h-12 rounded-lg object-cover" />
            <div>
              <h1 className="text-white font-bold text-lg">GALVANIY TECHNOLOGIES</h1>
              <p className="text-slate-400 text-sm">Willing the future into existence</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-blue-400 font-bold text-xl">INVOICE</div>
            <div className="text-slate-400 text-sm">{invoice.invoiceNumber}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-slate-900/80 border border-white/10 border-t-0 rounded-b-2xl p-6 space-y-6 print:bg-white print:text-black">

          {/* Status + Dates */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[isPaid ? 'PAID' : invoice.status] || statusColors.UNPAID}`}>
              {isPaid ? '✅ PAID' : invoice.status}
            </span>
            <div className="text-sm text-slate-400 space-x-4">
              <span>Issued: {new Date(invoice.createdAt).toLocaleDateString()}</span>
              {invoice.dueDate && <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>}
              {invoice.paidAt && <span className="text-emerald-400">Paid: {new Date(invoice.paidAt).toLocaleDateString()}</span>}
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">From</div>
              <div className="text-white font-semibold">Galvaniy Technologies</div>
              <div className="text-slate-400 text-sm">BN-AYSMZKAY</div>
              <div className="text-slate-400 text-sm">Kangundo Rd, Nairobi</div>
              <div className="text-slate-400 text-sm">P.O BOX 90119-00100</div>
              <div className="text-slate-400 text-sm mt-1">galvanytech@gmail.com</div>
            </div>
            <div>
              <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">Billed To</div>
              <div className="text-white font-semibold whitespace-pre-wrap">{invoice.clientName || 'Client'}</div>
              {invoice.clientEmail && <div className="text-slate-400 text-sm whitespace-pre-wrap">{invoice.clientEmail}</div>}
              {invoice.clientPhone && <div className="text-slate-400 text-sm mt-1">{invoice.clientPhone}</div>}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/60 text-slate-300">
                  <th className="text-left py-3 px-4 rounded-l-lg">Description</th>
                  <th className="text-center py-3 px-4">Qty</th>
                  <th className="text-right py-3 px-4">Unit Price</th>
                  <th className="text-right py-3 px-4 rounded-r-lg">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white">{item.description}</td>
                    <td className="py-3 px-4 text-center text-slate-300">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{invoice.currency} {item.unitPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-white font-medium">{invoice.currency} {(item.quantity * item.unitPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10">
                  <td colSpan={2}></td>
                  <td className="py-2 px-4 text-right text-slate-400 font-medium">Subtotal</td>
                  <td className="py-2 px-4 text-right text-white">{invoice.currency} {invoice.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={2}></td>
                  <td className="py-2 px-4 text-right text-slate-400">Tax</td>
                  <td className="py-2 px-4 text-right text-slate-300">{invoice.tax ? `${invoice.currency} ${invoice.tax.toLocaleString()}` : 'N/A'}</td>
                </tr>
                <tr className="bg-slate-800/80 rounded-lg">
                  <td colSpan={2}></td>
                  <td className="py-3 px-4 text-right text-white font-bold text-base rounded-l-lg">TOTAL</td>
                  <td className="py-3 px-4 text-right text-blue-400 font-bold text-lg rounded-r-lg">{invoice.currency} {invoice.total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5">
              <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">Notes</div>
              <p className="text-slate-300 text-sm">{invoice.notes}</p>
            </div>
          )}

          {/* Action Buttons — Print Area Hidden */}
          <div className="print:hidden space-y-4 pt-4 border-t border-white/10">

            {/* Pay Button Area */}
            {!isPaid && invoice.status !== 'CANCELLED' && (
              <div className="space-y-3">
                {payStep === 'idle' && (
                  <button
                    onClick={() => setPayStep('input')}
                    className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/20 hover:brightness-110 transition-all transform active:scale-95 text-lg"
                  >
                    💳 Pay with M-Pesa
                  </button>
                )}

                {payStep === 'input' && (
                  <div className="bg-slate-800/60 rounded-xl p-4 space-y-3">
                    <label className="block text-sm text-slate-300">Enter M-Pesa Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    {payError && <p className="text-red-400 text-sm">{payError}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => setPayStep('idle')} className="flex-1 py-3 rounded-xl font-medium text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all">
                        Cancel
                      </button>
                      <button onClick={handlePay} disabled={!phone} className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 transition-all disabled:opacity-50">
                        Send STK Push
                      </button>
                    </div>
                  </div>
                )}

                {payStep === 'sending' && (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-slate-300">Sending STK Push...</p>
                  </div>
                )}

                {payStep === 'waiting' && (
                  <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-white font-semibold">Check your phone</p>
                    <p className="text-slate-400 text-sm mt-1">Enter your M-Pesa PIN to complete payment</p>
                  </div>
                )}
              </div>
            )}

            {/* Paid Success */}
            {isPaid && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-emerald-400 font-bold text-lg">Payment Successful!</p>
                <p className="text-slate-400 text-sm mt-1">Thank you for your payment</p>
              </div>
            )}

            {/* Download + Print */}
            <div className="flex gap-3">
              {isPaid ? (
                <>
                  <button
                    onClick={handlePreviewReceipt}
                    className="flex-1 py-3 rounded-xl font-medium text-slate-300 hover:text-white border border-emerald-500/30 hover:bg-emerald-500/10 transition-all flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Preview Receipt</span>
                  </button>
                  <button
                    onClick={handleDownloadReceipt}
                    className="flex-1 py-3 rounded-xl font-medium text-slate-300 hover:text-white border border-emerald-500/30 hover:bg-emerald-500/10 transition-all flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 rounded-xl font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Invoice PDF</span>
                </button>
              )}
              <button
                onClick={handlePrint}
                className="flex-1 py-3 rounded-xl font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-slate-500 text-xs pt-4 border-t border-white/5">
            <p>Galvaniy Technologies — Nairobi, Kenya — galvanytech@gmail.com</p>
          </div>
        </div>
      </div>

      {/* PDF PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
          <div className="w-full max-w-4xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex flex-col h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
              <h3 className="text-white font-bold">Receipt Preview</h3>
              <div className="flex space-x-3">
                <button 
                  onClick={handleDownloadReceipt}
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-all text-sm font-medium flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span>Download PDF</span>
                </button>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white relative">
              {previewPdfUrl ? (
                <iframe src={previewPdfUrl} className="w-full h-full border-0" title="Receipt Preview" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400">Generating receipt...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;
