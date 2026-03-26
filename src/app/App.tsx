import { useState } from 'react';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceData {
  fromName: string;
  fromAddress: string;
  fromEmail: string;
  fromPhone: string;
  billToName: string;
  billToAddress: string;
  billToEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  notes: string;
  taxRate: number;
  currency: string;
}

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    fromName: '',
    fromAddress: '',
    fromEmail: '',
    fromPhone: '',
    billToName: '',
    billToAddress: '',
    billToEmail: '',
    invoiceNumber: 'INV-001',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    lineItems: [{ id: '1', description: '', quantity: 1, rate: 0 }],
    notes: '',
    taxRate: 0,
    currency: 'USD',
  });

  const calculateSubtotal = () => {
    return invoiceData.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (invoiceData.taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Get currency symbol
    const getCurrencySymbol = (currency: string) => {
      const symbols: { [key: string]: string } = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        CAD: '$',
        AUD: '$',
        JPY: '¥',
        INR: '₹',
        CNY: '¥',
      };
      return symbols[currency] || '$';
    };
    const currencySymbol = getCurrencySymbol(invoiceData.currency);
    
    // Set font
    doc.setFont('helvetica');
    
    // Header - From section
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('FROM', 20, 20);
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(invoiceData.fromName || 'Your Name', 20, 28);
    doc.setFontSize(10);
    doc.setTextColor(100);
    if (invoiceData.fromAddress) doc.text(invoiceData.fromAddress, 20, 35);
    if (invoiceData.fromEmail) doc.text(invoiceData.fromEmail, 20, 41);
    if (invoiceData.fromPhone) doc.text(invoiceData.fromPhone, 20, 47);
    
    // Bill To section
    doc.setFontSize(11);
    doc.text('BILL TO', 20, 60);
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(invoiceData.billToName || 'Client Name', 20, 68);
    doc.setFontSize(10);
    doc.setTextColor(100);
    if (invoiceData.billToAddress) doc.text(invoiceData.billToAddress, 20, 75);
    if (invoiceData.billToEmail) doc.text(invoiceData.billToEmail, 20, 81);
    
    // Invoice details (right side)
    doc.setFontSize(24);
    doc.setTextColor(0);
    doc.text('INVOICE', pageWidth - 20, 20, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, pageWidth - 20, 32, { align: 'right' });
    doc.text(`Date: ${invoiceData.invoiceDate}`, pageWidth - 20, 38, { align: 'right' });
    if (invoiceData.dueDate) doc.text(`Due Date: ${invoiceData.dueDate}`, pageWidth - 20, 44, { align: 'right' });
    
    // Line items table
    let yPos = 100;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('DESCRIPTION', 20, yPos);
    doc.text('QTY', pageWidth - 90, yPos, { align: 'right' });
    doc.text('RATE', pageWidth - 60, yPos, { align: 'right' });
    doc.text('AMOUNT', pageWidth - 20, yPos, { align: 'right' });
    
    yPos += 6;
    doc.setDrawColor(230);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    yPos += 8;
    doc.setTextColor(0);
    doc.setFontSize(10);
    
    invoiceData.lineItems.forEach((item) => {
      if (item.description) {
        const amount = item.quantity * item.rate;
        doc.text(item.description, 20, yPos);
        doc.text(item.quantity.toString(), pageWidth - 90, yPos, { align: 'right' });
        doc.text(`${currencySymbol}${item.rate.toFixed(2)}`, pageWidth - 60, yPos, { align: 'right' });
        doc.text(`${currencySymbol}${amount.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
        yPos += 8;
      }
    });
    
    // Totals section
    yPos += 10;
    doc.setDrawColor(230);
    doc.line(pageWidth - 80, yPos, pageWidth - 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Subtotal:', pageWidth - 80, yPos);
    doc.setTextColor(0);
    doc.text(`${currencySymbol}${calculateSubtotal().toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
    
    if (invoiceData.taxRate > 0) {
      yPos += 7;
      doc.setTextColor(100);
      doc.text(`Tax (${invoiceData.taxRate}%):`, pageWidth - 80, yPos);
      doc.setTextColor(0);
      doc.text(`${currencySymbol}${calculateTax().toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
    }
    
    yPos += 10;
    doc.setDrawColor(230);
    doc.line(pageWidth - 80, yPos, pageWidth - 20, yPos);
    
    yPos += 8;
    doc.setFontSize(12);
    doc.text('Total:', pageWidth - 80, yPos);
    doc.text(`${currencySymbol}${calculateTotal().toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
    
    // Notes
    if (invoiceData.notes) {
      yPos += 20;
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text('NOTES', 20, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.setTextColor(100);
      const splitNotes = doc.splitTextToSize(invoiceData.notes, pageWidth - 40);
      doc.text(splitNotes, 20, yPos);
    }
    
    doc.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#1c1c1e]">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl tracking-tight">Invoice Generator</h1>
            <p className="text-sm text-white/50 mt-1">Create professional invoices in seconds</p>
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-6 py-3 bg-[#0A84FF] hover:bg-[#0A84FF]/90 rounded-full transition-all duration-200 active:scale-95"
          >
            <Download size={18} />
            <span className="font-medium">Export PDF</span>
          </button>
        </div>
      </header>

      {/* Main Content - Split Panel */}
      <div className="grid grid-cols-2 gap-8 p-8 h-[calc(100vh-100px)]">
        {/* Left Panel - Form */}
        <div className="overflow-y-auto pr-4">
          <InvoiceForm
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
          />
        </div>

        {/* Right Panel - Preview */}
        <div className="overflow-y-auto pl-4">
          <InvoicePreview
            invoiceData={invoiceData}
            subtotal={calculateSubtotal()}
            tax={calculateTax()}
            total={calculateTotal()}
          />
        </div>
      </div>
    </div>
  );
}

export default App;