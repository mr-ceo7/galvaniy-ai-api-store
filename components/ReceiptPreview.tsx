import React, { useEffect, useState } from 'react';
import { generateReceipt } from '../services/receiptService';

const ReceiptPreview: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      // Mock data for the receipt preview
      const doc = await generateReceipt({
        transactionId: 'TXN-ABC-12345',
        date: new Date().toLocaleDateString(),
        planName: 'Pro',
        amount: 5000,
        paymentMethod: 'M-Pesa',
        phone: '254712345678',
        apiKey: 'sk_live_1234567890abcdef',
        tokens: '5000 Tokens/mo',
      }, true); // The true flag will return the doc instead of downloading

      if (doc) {
        setPdfUrl(doc.output('datauristring'));
      }
    };
    loadPdf();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-8">
      <h1 className="text-white text-2xl font-bold mb-6">Receipt Preview</h1>
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden h-[800px]">
        {pdfUrl ? (
          <iframe src={pdfUrl} className="w-full h-full border-0" title="Receipt PDF" />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            Generating high-quality PDF receipt...
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptPreview;
