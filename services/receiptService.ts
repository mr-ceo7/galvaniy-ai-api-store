import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReceiptData {
  transactionId: string;
  date: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  phone: string;
  apiKey?: string;
}

export const generateReceipt = (data: ReceiptData) => {
  const doc = new jsPDF();

  // Header & Branding
  doc.setFontSize(22);
  doc.setTextColor(33, 150, 243); // Blue branding
  doc.text('Galvaniy Technologies', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Payment Receipt', 14, 28);
  
  doc.text('Nairobi, Kenya', 14, 34);
  doc.text('support@galvaniy.ai', 14, 39);
  
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(`Date: ${data.date}`, 140, 28, { align: 'right' });

  // Add decorative line
  doc.setDrawColor(200);
  doc.line(14, 42, 196, 42);

  // Transaction Summary
  const tableBody = [
    ['Transaction ID', data.transactionId],
    ['Plan', data.planName],
    ['Amount Paid', `KES ${data.amount.toLocaleString()}`],
    ['Payment Method', `${data.paymentMethod} (${data.phone})`],
    ['Status', 'Successfully Paid'],
  ];

  if (data.apiKey) {
    tableBody.push(['API Key', '****************' + data.apiKey.slice(-5)]);
  }

  autoTable(doc, {
    startY: 50,
    head: [['Item', 'Details']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [33, 150, 243], textColor: 255 },
    styles: { fontSize: 11, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
    },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Thank you for your business!', 14, finalY);
  
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('For support, contact support@galvaniy.ai', 14, finalY + 6);

  // Save the PDF
  doc.save(`Galvaniy_Receipt_${data.transactionId}.pdf`);
};
