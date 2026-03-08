import React, { useState, useEffect } from 'react';
import { listInvoices, createInvoice, Invoice, InvoiceItem } from '../services/invoiceService';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

const AdminInvoices: React.FC = () => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [tax, setTax] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // AI Agent State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');

  useEffect(() => {
    if (view === 'list') {
      loadInvoices();
    }
  }, [view]);

  const loadInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const validItems = items.filter(i => i.description && i.quantity > 0 && i.unitPrice >= 0);
      if (validItems.length === 0) throw new Error('Add at least one item');
      if (!clientName) throw new Error('Client name is required');

      await createInvoice({
        clientName,
        clientEmail,
        clientPhone,
        items: validItems,
        tax: Number(tax),
        dueDate,
        notes
      });
      
      // Reset and go back to list
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
      setTax(0);
      setDueDate('');
      setNotes('');
      setAiPrompt('');
      setView('list');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateWithAI = async () => {
    if (!aiPrompt || !GEMINI_API_KEY) {
        setAiFeedback(!GEMINI_API_KEY ? 'Gemini API Key missing in environment.' : 'Please enter a prompt.');
        return;
    }
    
    setIsGenerating(true);
    setAiFeedback('');
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI assistant that extracts invoice data from natural language and returns JSON. 
Extract the following fields from the user input if present, otherwise omit them or provide sensible defaults.
Fields: clientName, clientEmail, clientPhone, items (array of objects with 'description' string, 'quantity' number, 'unitPrice' number), tax (number), dueDate (YYYY-MM-DD string), notes (string).
Current Date for relative dates is: ${new Date().toISOString().split('T')[0]}.
User input: "${aiPrompt}"

Ensure your entire output is valid JSON strictly matching the fields requested without markdown formatting blocks like \`\`\`json.`
            }]
          }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      let textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Clean possible markdown code blocks
      textOutput = textOutput.replace(/```json/gi, '').replace(/```/gi, '').trim();
      
      const parsed = JSON.parse(textOutput);
      
      if (parsed.clientName) setClientName(parsed.clientName);
      if (parsed.clientEmail) setClientEmail(parsed.clientEmail);
      if (parsed.clientPhone) setClientPhone(parsed.clientPhone);
      if (parsed.items && Array.isArray(parsed.items)) setItems(parsed.items);
      if (parsed.tax !== undefined) setTax(parsed.tax);
      if (parsed.dueDate) setDueDate(parsed.dueDate);
      if (parsed.notes) setNotes(parsed.notes);

      setAiFeedback('✅ Invoice form auto-filled successfully! Please review before saving.');
    } catch (err: any) {
      console.error(err);
      setAiFeedback('❌ Failed to parse prompt. Please try being more specific.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/invoice/${id}`;
    navigator.clipboard.writeText(url);
    alert('Invoice link copied!');
  };

  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Admin Invoices
            </h1>
            <p className="text-slate-400 mt-1">Manage and generate client invoices</p>
          </div>
          <div className="space-x-4">
            <button 
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Invoice List
            </button>
            <button 
              onClick={() => setView('create')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${view === 'create' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              + Create Invoice
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-xl font-bold text-white mb-2">No invoices found</h3>
                <p className="text-slate-400">Create your first invoice to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-white/10">
                      <th className="py-4 px-6 text-sm font-semibold text-slate-300">Invoice #</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-300">Client</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-300">Status</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-right">Total</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-300">Date Issued</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-white/5 hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 text-blue-400 font-medium">{inv.invoiceNumber}</td>
                        <td className="py-4 px-6 text-white">{inv.clientName || 'N/A'}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full border ${
                            inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            inv.status === 'UNPAID' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-medium text-white">{inv.currency} {inv.total.toLocaleString()}</td>
                        <td className="py-4 px-6 text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-center">
                          <button 
                            onClick={() => copyLink(inv.id)}
                            className="text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-white/10 inline-flex items-center space-x-2"
                          >
                            <span>🔗</span> <span>Copy Link</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create View */}
        {view === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: AI Agent */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                  <span className="text-2xl mr-2">✨</span> AI Invoice Agent
                </h3>
                <p className="text-sm text-indigo-200 mb-4">
                  Describe what you need in natural language, and the AI will fill out the form for you.
                </p>
                
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Create an invoice for John Doe (john@example.com). He bought 2 Pro API Plans at 5000 KES each. Due in 7 days."
                  className="w-full bg-slate-900/50 border border-indigo-500/30 rounded-xl p-3 text-sm text-white placeholder-indigo-300/50 focus:outline-none focus:border-indigo-400 h-32 mb-4 resize-none"
                />
                
                <button
                  onClick={generateWithAI}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex justify-center items-center"
                >
                  {isGenerating ? (
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Generate Invoice Data'
                  )}
                </button>
                
                {aiFeedback && (
                  <p className={`mt-4 text-sm font-medium ${aiFeedback.startsWith('✅') ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {aiFeedback}
                  </p>
                )}
              </div>
            </div>

            {/* Right Col: Manual Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleCreate} className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Client Name <span className="text-red-400">*</span></label>
                    <input type="text" required value={clientName} onChange={e=>setClientName(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Client Email</label>
                    <input type="email" value={clientEmail} onChange={e=>setClientEmail(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Client Phone</label>
                    <input type="tel" value={clientPhone} onChange={e=>setClientPhone(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Due Date</label>
                    <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-bold text-white">Line Items</h4>
                    <button type="button" onClick={addItem} className="text-sm text-blue-400 hover:text-blue-300 font-medium bg-blue-500/10 px-3 py-1 rounded-lg">
                      + Add Item
                    </button>
                  </div>
                  
                  {items.map((item, index) => (
                    <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-start bg-slate-800/50 p-3 rounded-lg border border-white/5 relative group">
                      <div className="flex-grow min-w-[200px]">
                        <input type="text" placeholder="Description" required value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="w-24">
                        <input type="number" min="1" required value={item.quantity} onChange={e => updateItem(index, 'quantity', Number(e.target.value))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 text-center" />
                      </div>
                      <div className="w-32">
                        <input type="number" min="0" required placeholder="Price" value={item.unitPrice} onChange={e => updateItem(index, 'unitPrice', Number(e.target.value))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 text-right" />
                      </div>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)} className="mt-1 md:mt-0 p-2 text-slate-500 hover:text-red-400 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Notes / Terms</label>
                    <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Thank you for your business!" className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"></textarea>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-4 flex flex-col justify-end">
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span>Subtotal:</span>
                      <span>KES {items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-400 mb-4 border-b border-white/10 pb-4">
                      <span>Tax Amount (KES):</span>
                      <input type="number" value={tax} onChange={e=>setTax(Number(e.target.value))} className="w-24 bg-slate-800 border border-white/10 rounded p-1 text-right text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-white">
                      <span>Total:</span>
                      <span className="text-blue-400">KES {(items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) + Number(tax)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Saving...' : 'Create Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInvoices;
