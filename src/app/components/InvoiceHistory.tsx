import { Trash2, FileText, Clock } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface InvoiceSummary {
  id: string;
  invoice_data: {
    invoiceNumber: string;
    invoiceDate: string;
    billToName: string;
    currency: string;
    lineItems: { quantity: number; rate: number }[];
    taxRate: number;
  };
  created_at: string;
}

interface InvoiceHistoryProps {
  invoices: InvoiceSummary[];
  activeId: string | null;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

const currencySymbols: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$', JPY: '¥', INR: '₹', CNY: '¥',
};

export function InvoiceHistory({ invoices, activeId, onLoad, onDelete }: InvoiceHistoryProps) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/40">
        <FileText size={40} className="mb-3" />
        <p className="text-sm">No saved invoices yet</p>
        <p className="text-xs mt-1">Invoices you save will appear here</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-2 pr-3">
        {invoices.map((inv) => {
          const data = inv.invoice_data || {};
          const symbol = currencySymbols[data.currency] || '$';
          const items = Array.isArray(data.lineItems) ? data.lineItems : [];
          const subtotal = items.reduce((s, i) => s + (i.quantity || 0) * (i.rate || 0), 0);
          const total = subtotal + subtotal * ((data.taxRate || 0) / 100);
          const isActive = inv.id === activeId;

          return (
            <button
              key={inv.id}
              onClick={() => onLoad(inv.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                isActive
                  ? 'bg-[#0A84FF]/10 border-[#0A84FF]/40'
                  : 'bg-[#1c1c1e] border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">
                      {data.invoiceNumber || 'Untitled'}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-1 truncate">
                    {data.billToName || 'No client'}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Clock size={11} />
                      {data.invoiceDate || 'No date'}
                    </span>
                    <span className="text-sm font-medium text-[#0A84FF]">
                      {symbol}{total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(inv.id);
                  }}
                  className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
