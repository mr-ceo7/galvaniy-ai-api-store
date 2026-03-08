import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

interface ReceiptData {
  transactionId: string;
  date: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  phone: string;
  apiKey?: string;
  tokens?: string;
}

// Helper to load image as base64 for jsPDF
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

export const generateReceipt = async (data: ReceiptData, returnDoc: boolean = false) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ─── BRANDED HEADER BANNER ───────────────────────────────────────
  // Dark banner background
  doc.setFillColor(15, 15, 20);
  doc.rect(0, 0, pageWidth, 48, 'F');

  // Add subtle accent line at bottom of banner
  doc.setFillColor(33, 150, 243);
  doc.rect(0, 48, pageWidth, 1.5, 'F');

  // Logo (try to load, fallback to text)
  try {
    const logoBase64 = await loadImageAsBase64('/galvaniy-logo.jpg');
    doc.addImage(logoBase64, 'JPEG', 14, 8, 32, 32);
  } catch {
    // Fallback: text logo
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('G', 22, 28);
  }

  // Company name on banner
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('GALVANIY TECHNOLOGIES', 52, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 160, 180);
  doc.text('Willing the future into existence', 52, 29);

  // Receipt label on right
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 150, 243);
  doc.text('RECEIPT', pageWidth - 14, 22, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(150, 160, 180);
  doc.text(`#${data.transactionId.slice(0, 20)}`, pageWidth - 14, 29, { align: 'right' });
  doc.text(data.date, pageWidth - 14, 35, { align: 'right' });

  // ─── TWO-COLUMN BILLING INFO ─────────────────────────────────────
  const billingY = 60;

  // FROM (Company)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 150, 243);
  doc.text('FROM', 14, billingY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Galvaniy Technologies', 14, billingY + 6);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 110);
  doc.text('BN-AYSMZKAY', 14, billingY + 12);
  doc.text('Kangundo Rd, Nairobi', 14, billingY + 17);
  doc.text('P.O BOX 90119-00100', 14, billingY + 22);
  doc.text('galvanytech@gmail.com', 14, billingY + 27);

  // TO (Customer)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 150, 243);
  doc.text('BILLED TO', pageWidth / 2 + 10, billingY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 50);
  
  let toY = billingY + 6;

  // The Customer name/contact might have newlines if we port data from invoice.
  // We'll treat data.phone as the primary contact string which can be multi-line
  if (data.phone) {
    const phoneLines = data.phone.split('\n');
    doc.text('Customer', pageWidth / 2 + 10, toY);
    toY += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 110);
    doc.text(phoneLines, pageWidth / 2 + 10, toY);
    toY += phoneLines.length * 5;
  } else {
    doc.text('Customer', pageWidth / 2 + 10, toY);
    toY += 6;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 110);
  doc.text(`Method: ${data.paymentMethod}`, pageWidth / 2 + 10, toY + 2);

  // ─── DIVIDER ─────────────────────────────────────────────────────
  const dividerY = billingY + 30;
  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.5);
  doc.line(14, dividerY, pageWidth - 14, dividerY);

  // ─── ITEMIZED TABLE ──────────────────────────────────────────────
  const tableStartY = dividerY + 6;

  autoTable(doc, {
    startY: tableStartY,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: [
      [
        `${data.planName} API Plan${data.tokens ? `\n(${data.tokens})` : ''}`,
        '1',
        `KES ${data.amount.toLocaleString()}`,
        `KES ${data.amount.toLocaleString()}`
      ],
    ],
    foot: [
      [
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: 'Subtotal', styles: { fillColor: [250, 250, 252], fontStyle: 'bold', textColor: [80, 80, 90] } },
        { content: `KES ${data.amount.toLocaleString()}`, styles: { fillColor: [250, 250, 252], fontStyle: 'bold', textColor: [80, 80, 90] } }
      ],
      [
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: 'Tax', styles: { fillColor: [250, 250, 252], textColor: [130, 130, 140] } },
        { content: 'N/A', styles: { fillColor: [250, 250, 252], textColor: [130, 130, 140] } }
      ],
      [
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: 'TOTAL', styles: { fillColor: [15, 15, 20], fontStyle: 'bold', textColor: [255, 255, 255], fontSize: 12 } },
        { content: `KES ${data.amount.toLocaleString()}`, styles: { fillColor: [15, 15, 20], fontStyle: 'bold', textColor: [33, 150, 243], fontSize: 12 } }
      ],
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [245, 247, 250],
      textColor: [80, 80, 100],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [40, 40, 50],
      cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
    },
    footStyles: {
      fontSize: 10,
      cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
    tableLineColor: [230, 230, 235],
    tableLineWidth: 0.3,
  });

  const afterTableY = (doc as any).lastAutoTable.finalY;

  // ─── API KEY BOX (if available) ──────────────────────────────────
  let currentY = afterTableY + 12;

  if (data.apiKey) {
    doc.setFillColor(245, 247, 250);
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(0.8);
    doc.roundedRect(14, currentY, pageWidth - 28, 22, 3, 3, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 150, 243);
    doc.text('API KEY', 20, currentY + 7);

    doc.setFontSize(11);
    doc.setFont('courier', 'normal');
    doc.setTextColor(40, 40, 50);
    const maskedKey = '•'.repeat(Math.max(0, data.apiKey.length - 8)) + data.apiKey.slice(-8);
    doc.text(maskedKey, 20, currentY + 15);

    currentY += 30;
  }

  // ─── "PAID" STAMP ────────────────────────────────────────────────
  doc.saveGraphicsState();
  doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
  doc.setFontSize(72);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94);

  // Rotate and place the stamp
  const centerX = pageWidth / 2;
  const centerY = 140;
  doc.text('PAID', centerX, centerY, {
    align: 'center',
    angle: 25,
  });
  doc.restoreGraphicsState();

  // ─── FOOTER ──────────────────────────────────────────────────────
  const footerY = Math.max(currentY + 10, afterTableY + 30);

  // Divider line
  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.3);
  doc.line(14, footerY, pageWidth - 14, footerY);

  // Thank you message
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 50);
  doc.text('Thank you for choosing Galvaniy Technologies!', 14, footerY + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(140, 140, 150);
  doc.text('For support or questions, contact galvanytech@gmail.com', 14, footerY + 14);
  doc.text('This receipt was automatically generated and is valid without a signature.', 14, footerY + 19);

  // ─── BOTTOM ACCENT BAR ───────────────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(15, 15, 20);
  doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');
  doc.setFillColor(33, 150, 243);
  doc.rect(0, pageHeight - 6, pageWidth, 1.5, 'F');

  // ─── QR CODE ───────────────────────────────────────────────────
  try {
    // Determine the URL to embed (assuming invoice route for tracking/verification)
    // You could also create a dedicated receipt view route if preferred
    const invoiceUrl = `${window.location.origin}/invoice/${data.transactionId}`;
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
    // Align text centered perfectly under the QR box dynamically
    doc.text('Scan to Verify Receipt', qrX + (qrSize/2), qrY + qrSize + 3, { align: 'center' });
  } catch (err) {
    console.error('QR Generation failed:', err);
  }

  // ─── SAVE OR RETURN ──────────────────────────────────────────────
  if (returnDoc) {
    return doc;
  }
  doc.save(`Galvaniy_Receipt_${data.transactionId}.pdf`);
};
