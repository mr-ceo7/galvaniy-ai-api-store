import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

const PAYMENT_BACKEND_URL = import.meta.env.VITE_PAYMENT_BACKEND_URL || 'https://uon-smart-backend.onrender.com';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
  dueDate: string;
  notes: string;
  createdAt: string;
  paidAt: string | null;
  transactionId: string | null;
}

// ─── API CALLS ─────────────────────────────────────────────────────

export const fetchInvoice = async (id: string): Promise<Invoice> => {
  const res = await fetch(`${PAYMENT_BACKEND_URL}/api/invoices/${id}`);
  if (!res.ok) throw new Error('Invoice not found');
  return res.json();
};

export const createInvoice = async (data: {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  items: InvoiceItem[];
  tax?: number;
  dueDate?: string;
  notes?: string;
}): Promise<{ success: boolean; id: string; invoiceNumber: string }> => {
  const res = await fetch(`${PAYMENT_BACKEND_URL}/api/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create invoice');
  }
  return res.json();
};

export const listInvoices = async (filters?: { status?: string }): Promise<Invoice[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  const res = await fetch(`${PAYMENT_BACKEND_URL}/api/invoices?${params}`);
  if (!res.ok) throw new Error('Failed to list invoices');
  return res.json();
};

export const payInvoice = async (invoiceId: string, phone: string) => {
  const res = await fetch(`${PAYMENT_BACKEND_URL}/api/invoices/${invoiceId}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Payment failed');
  }
  return res.json();
};

// ─── LOGO HELPER ───────────────────────────────────────────────────

const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context failed');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = reject;
    img.src = url;
  });
};

// ─── PDF GENERATION ────────────────────────────────────────────────

export const generateInvoicePDF = async (invoice: Invoice) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ─── BRANDED HEADER ────────────────────────────────────────────
  doc.setFillColor(15, 15, 20);
  doc.rect(0, 0, pageWidth, 48, 'F');
  doc.setFillColor(33, 150, 243);
  doc.rect(0, 48, pageWidth, 1.5, 'F');

  try {
    const logoBase64 = await loadImageAsBase64('/galvaniy-logo.jpg');
    doc.addImage(logoBase64, 'JPEG', 14, 8, 32, 32);
  } catch {
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('G', 22, 28);
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('GALVANIY TECHNOLOGIES', 52, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 160, 180);
  doc.text('Willing the future into existence', 52, 29);

  // Invoice label + number
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 150, 243);
  doc.text('INVOICE', pageWidth - 14, 22, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(150, 160, 180);
  doc.text(invoice.invoiceNumber, pageWidth - 14, 29, { align: 'right' });
  doc.text(`Issued: ${new Date(invoice.createdAt).toLocaleDateString()}`, pageWidth - 14, 35, { align: 'right' });
  if (invoice.dueDate) {
    doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, pageWidth - 14, 41, { align: 'right' });
  }

  // ─── TWO-COLUMN BILLING ────────────────────────────────────────
  const billingY = 60;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 150, 243);
  doc.text('FROM', 14, billingY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 50);
  doc.text('Galvaniy Technologies', 14, billingY + 6);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 110);
  doc.text('BN-AYSMZKAY', 14, billingY + 12);
  doc.text('Kangundo Rd, Nairobi', 14, billingY + 17);
  doc.text('P.O BOX 90119-00100', 14, billingY + 22);
  doc.text('galvanytech@gmail.com', 14, billingY + 27);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 150, 243);
  doc.text('BILLED TO', pageWidth / 2 + 10, billingY);

  let toY = billingY + 6;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 50);

  if (invoice.clientName) {
    const nameLines = invoice.clientName.split('\n');
    doc.text(nameLines, pageWidth / 2 + 10, toY);
    toY += nameLines.length * 5 + 1;
  } else {
    doc.text('Client', pageWidth / 2 + 10, toY);
    toY += 6;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 110);
  
  if (invoice.clientEmail) {
    const emailLines = invoice.clientEmail.split('\n');
    doc.text(emailLines, pageWidth / 2 + 10, toY);
    toY += emailLines.length * 5;
  }
  if (invoice.clientPhone) {
    doc.text(invoice.clientPhone, pageWidth / 2 + 10, toY);
  }

  // ─── DIVIDER ───────────────────────────────────────────────────
  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.5);
  doc.line(14, billingY + 25, pageWidth - 14, billingY + 25);

  // ─── ITEMIZED TABLE ────────────────────────────────────────────
  const items = invoice.items || [];
  const tableBody = items.map(item => [
    item.description,
    String(item.quantity),
    `${invoice.currency} ${item.unitPrice.toLocaleString()}`,
    `${invoice.currency} ${(item.quantity * item.unitPrice).toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: billingY + 31,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: tableBody,
    foot: [
      [
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: 'Subtotal', styles: { fillColor: [250, 250, 252], fontStyle: 'bold', textColor: [80, 80, 90] } },
        { content: `${invoice.currency} ${invoice.subtotal.toLocaleString()}`, styles: { fillColor: [250, 250, 252], fontStyle: 'bold', textColor: [80, 80, 90] } }
      ],
      [
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: 'Tax', styles: { fillColor: [250, 250, 252], textColor: [130, 130, 140] } },
        { content: invoice.tax ? `${invoice.currency} ${invoice.tax.toLocaleString()}` : 'N/A', styles: { fillColor: [250, 250, 252], textColor: [130, 130, 140] } }
      ],
      [
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: 'TOTAL', styles: { fillColor: [15, 15, 20], fontStyle: 'bold', textColor: [255, 255, 255], fontSize: 12 } },
        { content: `${invoice.currency} ${invoice.total.toLocaleString()}`, styles: { fillColor: [15, 15, 20], fontStyle: 'bold', textColor: [33, 150, 243], fontSize: 12 } }
      ],
    ],
    theme: 'plain',
    headStyles: { fillColor: [245, 247, 250], textColor: [80, 80, 100], fontStyle: 'bold', fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 6, right: 6 } },
    bodyStyles: { fontSize: 10, textColor: [40, 40, 50], cellPadding: { top: 6, bottom: 6, left: 6, right: 6 } },
    footStyles: { fontSize: 10, cellPadding: { top: 4, bottom: 4, left: 6, right: 6 } },
    columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 40, halign: 'right' }, 3: { cellWidth: 40, halign: 'right' } },
    margin: { left: 14, right: 14 },
  });

  const afterTableY = (doc as any).lastAutoTable.finalY;

  // ─── NOTES ─────────────────────────────────────────────────────
  if (invoice.notes) {
    const notesY = afterTableY + 12;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 150, 243);
    doc.text('NOTES', 14, notesY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 110);
    doc.text(invoice.notes, 14, notesY + 6, { maxWidth: pageWidth - 28 });
  }

  // ─── STATUS STAMP ──────────────────────────────────────────────
  if (invoice.status === 'PAID') {
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
    doc.setFontSize(72);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text('PAID', pageWidth / 2, 140, { align: 'center', angle: 25 });
    doc.restoreGraphicsState();
  }

  // ─── FOOTER ────────────────────────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(15, 15, 20);
  doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');
  doc.setFillColor(33, 150, 243);
  doc.rect(0, pageHeight - 6, pageWidth, 1.5, 'F');

  // ─── QR CODE ───────────────────────────────────────────────────
  try {
    const invoiceUrl = `${window.location.origin}/invoice/${invoice.id}`;
    const qrDataUrl = await QRCode.toDataURL(invoiceUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 100
    });
    
    const qrSize = 24;
    const qrX = pageWidth - 14 - qrSize;
    // Position it just above the footer line
    const qrY = pageHeight - 12 - qrSize;
    
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 150);
    doc.text('Scan to Pay / View Online', qrX + (qrSize/2), qrY + qrSize + 3, { align: 'center' });
  } catch (err) {
    console.error('QR Generation failed:', err);
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(140, 140, 150);
  doc.text('Galvaniy Technologies — galvanytech@gmail.com', 14, pageHeight - 12);

  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};
