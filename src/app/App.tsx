import { useState, useEffect, useCallback, useRef } from 'react';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { InvoiceHistory } from './components/InvoiceHistory';
import { Download, Save, History, Plus } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

const emptyInvoice: InvoiceData = {
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
};

interface SavedInvoice {
  id: string;
  invoice_data: InvoiceData;
  created_at: string;
  updated_at: string;
}

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({ ...emptyInvoice });
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const calculateSubtotal = () => {
    return invoiceData.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (invoiceData.taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // --- API helpers ---

  const loadInvoices = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/invoices`);
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const data: SavedInvoice[] = await res.json();
      setInvoices(data);
    } catch {
      // Silently fail on initial load — API may not be running
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const method = invoiceId ? 'PUT' : 'POST';
      const url = invoiceId ? `${API_URL}/invoices/${invoiceId}` : `${API_URL}/invoices`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_data: invoiceData }),
      });
      if (!res.ok) throw new Error('Save failed');
      const saved: SavedInvoice = await res.json();
      setInvoiceId(saved.id);
      await loadInvoices();
      toast.success(invoiceId ? 'Invoice updated' : 'Invoice saved');
    } catch {
      toast.error('Could not save invoice. Is the backend running?');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadInvoice = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/invoices/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data: SavedInvoice = await res.json();
      const loaded: InvoiceData = {
        ...emptyInvoice,
        ...data.invoice_data,
        invoiceDate: data.invoice_data.invoiceDate || new Date().toISOString().split('T')[0],
        lineItems: Array.isArray(data.invoice_data.lineItems) && data.invoice_data.lineItems.length > 0
          ? data.invoice_data.lineItems
          : [{ id: '1', description: '', quantity: 1, rate: 0 }],
      };
      setInvoiceData(loaded);
      setInvoiceId(data.id);
      toast.success(`Loaded ${loaded.invoiceNumber}`);
    } catch {
      toast.error('Could not load invoice');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      if (invoiceId === id) {
        setInvoiceId(null);
        setInvoiceData({ ...emptyInvoice, invoiceDate: new Date().toISOString().split('T')[0] });
      }
      await loadInvoices();
      toast.success('Invoice deleted');
    } catch {
      toast.error('Could not delete invoice');
    }
  };

  const handleNew = () => {
    setInvoiceId(null);
    setInvoiceData({ ...emptyInvoice, invoiceDate: new Date().toISOString().split('T')[0] });
  };

  // --- PDF export (unchanged) ---

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const getCurrencySymbol = (currency: string) => {
      const symbols: { [key: string]: string } = {
        USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$', JPY: '¥', INR: '₹', CNY: '¥',
      };
      return symbols[currency] || '$';
    };
    const currencySymbol = getCurrencySymbol(invoiceData.currency);

    doc.setFont('helvetica');

    let logoOffset = 0;
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'AUTO', 20, 15, 40, 20);
        logoOffset = 25;
      } catch { /* skip logo on error */ }
    }

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('FROM', 20, 20 + logoOffset);
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(invoiceData.fromName || 'Your Name', 20, 28 + logoOffset);
    doc.setFontSize(10);
    doc.setTextColor(100);
    if (invoiceData.fromAddress) doc.text(invoiceData.fromAddress, 20, 35 + logoOffset);
    if (invoiceData.fromEmail) doc.text(invoiceData.fromEmail, 20, 41 + logoOffset);
    if (invoiceData.fromPhone) doc.text(invoiceData.fromPhone, 20, 47 + logoOffset);

    doc.setFontSize(11);
    doc.text('BILL TO', 20, 60 + logoOffset);
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(invoiceData.billToName || 'Client Name', 20, 68 + logoOffset);
    doc.setFontSize(10);
    doc.setTextColor(100);
    if (invoiceData.billToAddress) doc.text(invoiceData.billToAddress, 20, 75 + logoOffset);
    if (invoiceData.billToEmail) doc.text(invoiceData.billToEmail, 20, 81 + logoOffset);

    doc.setFontSize(24);
    doc.setTextColor(0);
    doc.text('INVOICE', pageWidth - 20, 20 + logoOffset, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, pageWidth - 20, 32 + logoOffset, { align: 'right' });
    doc.text(`Date: ${invoiceData.invoiceDate}`, pageWidth - 20, 38 + logoOffset, { align: 'right' });
    if (invoiceData.dueDate) doc.text(`Due Date: ${invoiceData.dueDate}`, pageWidth - 20, 44 + logoOffset, { align: 'right' });

    let yPos = 100 + logoOffset;
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
    <div className="h-screen overflow-hidden bg-[#0a0a0a] text-white flex flex-col">
      {/* Hidden file input for logo upload */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoUpload}
      />

      {/* Header */}
      <header className="border-b border-white/10 bg-[#1c1c1e] shrink-0">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl tracking-tight">Invoice Generator</h1>
            <p className="text-sm text-white/50 mt-1">Create professional invoices in seconds</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-200 active:scale-95"
            >
              <Plus size={18} />
              <span className="font-medium text-sm">New</span>
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-5 py-3 border rounded-full transition-all duration-200 active:scale-95 ${
                showHistory
                  ? 'bg-white/15 border-white/30 text-white'
                  : 'bg-white/5 hover:bg-white/10 border-white/10'
              }`}
            >
              <History size={18} />
              <span className="font-medium text-sm">History</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-3 bg-[#30D158] hover:bg-[#30D158]/90 text-black rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              <Save size={18} />
              <span className="font-medium text-sm">{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-5 py-3 bg-[#0A84FF] hover:bg-[#0A84FF]/90 rounded-full transition-all duration-200 active:scale-95"
            >
              <Download size={18} />
              <span className="font-medium text-sm">Export PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`grid ${showHistory ? 'grid-cols-[280px_1fr_1fr]' : 'grid-cols-2'} gap-0 flex-1 min-h-0`}>
        {/* History Panel */}
        {showHistory && (
          <div className="overflow-hidden p-8 pr-4 border-r border-white/10">
            <h2 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wider">Saved Invoices</h2>
            <InvoiceHistory
              invoices={invoices}
              activeId={invoiceId}
              onLoad={handleLoadInvoice}
              onDelete={handleDeleteInvoice}
            />
          </div>
        )}

        {/* Left Panel - Form */}
        <div className="overflow-y-auto p-8 pr-4">
          <InvoiceForm
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
          />
        </div>

        {/* Right Panel - Preview */}
        <div className="overflow-hidden p-8 pl-4 flex items-start justify-center">
          <InvoicePreview
            invoiceData={invoiceData}
            subtotal={calculateSubtotal()}
            tax={calculateTax()}
            total={calculateTotal()}
            logoDataUrl={logoDataUrl}
            onLogoClick={() => logoInputRef.current?.click()}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
