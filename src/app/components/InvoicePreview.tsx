import { FileText } from 'lucide-react';
import { InvoiceData } from '../App';

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
  subtotal: number;
  tax: number;
  total: number;
}

export function InvoicePreview({ invoiceData, subtotal, tax, total }: InvoicePreviewProps) {
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

  return (
    <div className="bg-white text-black rounded-2xl shadow-2xl min-h-[800px] overflow-hidden">
      {/* Accent stripe */}
      <div className="h-1 bg-gradient-to-r from-[#0A84FF] to-[#0A84FF]/60"></div>
      
      <div className="p-12">
        {/* Logo Placeholder */}
        <div className="mb-16 inline-flex items-center justify-center px-6 py-3 border-2 border-gray-200 rounded-lg">
          <span className="text-sm tracking-wide text-gray-400">YOUR LOGO</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-16">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">From</h3>
            <h2 className="text-2xl mb-2">
              {invoiceData.fromName || 'Your Name'}
            </h2>
            <div className="space-y-1 text-sm text-gray-600">
              {invoiceData.fromAddress && <p>{invoiceData.fromAddress}</p>}
              {invoiceData.fromEmail && <p>{invoiceData.fromEmail}</p>}
              {invoiceData.fromPhone && <p>{invoiceData.fromPhone}</p>}
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-5xl mb-4 tracking-tight">INVOICE</h1>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">
                <span className="text-gray-500">Invoice #:</span> {invoiceData.invoiceNumber}
              </p>
              <p className="text-gray-600">
                <span className="text-gray-500">Date:</span> {invoiceData.invoiceDate || 'N/A'}
              </p>
              {invoiceData.dueDate && (
                <p className="text-gray-600">
                  <span className="text-gray-500">Due Date:</span> {invoiceData.dueDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-12">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Bill To</h3>
          <h2 className="text-xl mb-2">
            {invoiceData.billToName || 'Client Name'}
          </h2>
          <div className="space-y-1 text-sm text-gray-600">
            {invoiceData.billToAddress && <p>{invoiceData.billToAddress}</p>}
            {invoiceData.billToEmail && <p>{invoiceData.billToEmail}</p>}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-12">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-xs uppercase tracking-wider text-gray-500">
                  Description
                </th>
                <th className="text-right py-3 text-xs uppercase tracking-wider text-gray-500 w-20">
                  Qty
                </th>
                <th className="text-right py-3 text-xs uppercase tracking-wider text-gray-500 w-28">
                  Rate
                </th>
                <th className="text-right py-3 text-xs uppercase tracking-wider text-gray-500 w-32">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.lineItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-4 text-sm">
                    {item.description || 'Item description'}
                  </td>
                  <td className="py-4 text-right text-sm text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="py-4 text-right text-sm text-gray-600">
                    {currencySymbol}{item.rate.toFixed(2)}
                  </td>
                  <td className="py-4 text-right">
                    {currencySymbol}{(item.quantity * item.rate).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-80">
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              {invoiceData.taxRate > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax ({invoiceData.taxRate}%)</span>
                  <span className="font-medium">{currencySymbol}{tax.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Total</span>
                  <span className="text-2xl">{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoiceData.notes && (
          <div className="pt-8 border-t border-gray-100">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Notes</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoiceData.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}