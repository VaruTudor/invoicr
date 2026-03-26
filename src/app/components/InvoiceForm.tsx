import { Plus, Trash2 } from 'lucide-react';
import { InvoiceData, LineItem } from '../App';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: (data: InvoiceData) => void;
}

export function InvoiceForm({ invoiceData, setInvoiceData }: InvoiceFormProps) {
  const updateField = (field: keyof InvoiceData, value: string | number) => {
    setInvoiceData({ ...invoiceData, [field]: value });
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
    };
    setInvoiceData({
      ...invoiceData,
      lineItems: [...invoiceData.lineItems, newItem],
    });
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoiceData({
      ...invoiceData,
      lineItems: invoiceData.lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const removeLineItem = (id: string) => {
    if (invoiceData.lineItems.length > 1) {
      setInvoiceData({
        ...invoiceData,
        lineItems: invoiceData.lineItems.filter((item) => item.id !== id),
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* From Section */}
      <section className="bg-[#1c1c1e] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-white/50 mb-6">From</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your Name / Business Name"
            value={invoiceData.fromName}
            onChange={(e) => updateField('fromName', e.target.value)}
            className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
          />
          <input
            type="text"
            placeholder="Address"
            value={invoiceData.fromAddress}
            onChange={(e) => updateField('fromAddress', e.target.value)}
            className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="email"
              placeholder="Email"
              value={invoiceData.fromEmail}
              onChange={(e) => updateField('fromEmail', e.target.value)}
              className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={invoiceData.fromPhone}
              onChange={(e) => updateField('fromPhone', e.target.value)}
              className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </section>

      {/* Bill To Section */}
      <section className="bg-[#1c1c1e] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-white/50 mb-6">Bill To</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Client Name / Company Name"
            value={invoiceData.billToName}
            onChange={(e) => updateField('billToName', e.target.value)}
            className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
          />
          <input
            type="text"
            placeholder="Address"
            value={invoiceData.billToAddress}
            onChange={(e) => updateField('billToAddress', e.target.value)}
            className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
          />
          <input
            type="email"
            placeholder="Email"
            value={invoiceData.billToEmail}
            onChange={(e) => updateField('billToEmail', e.target.value)}
            className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
          />
        </div>
      </section>

      {/* Invoice Details */}
      <section className="bg-[#1c1c1e] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-white/50 mb-6">Invoice Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs text-white/50 mb-2 block">Currency</label>
            <select
              value={invoiceData.currency}
              onChange={(e) => updateField('currency', e.target.value)}
              className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
            >
              <option value="USD">$ USD - US Dollar</option>
              <option value="EUR">€ EUR - Euro</option>
              <option value="GBP">£ GBP - British Pound</option>
              <option value="CAD">$ CAD - Canadian Dollar</option>
              <option value="AUD">$ AUD - Australian Dollar</option>
              <option value="JPY">¥ JPY - Japanese Yen</option>
              <option value="INR">₹ INR - Indian Rupee</option>
              <option value="CNY">¥ CNY - Chinese Yuan</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-2 block">Invoice Number</label>
            <input
              type="text"
              value={invoiceData.invoiceNumber}
              onChange={(e) => updateField('invoiceNumber', e.target.value)}
              className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">Date</label>
            <input
              type="date"
              value={invoiceData.invoiceDate}
              onChange={(e) => updateField('invoiceDate', e.target.value)}
              className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">Due Date</label>
            <input
              type="date"
              value={invoiceData.dueDate}
              onChange={(e) => updateField('dueDate', e.target.value)}
              className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </section>

      {/* Line Items */}
      <section className="bg-[#1c1c1e] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-white/50 mb-6">Line Items</h2>
        <div className="space-y-4">
          {invoiceData.lineItems.map((item, index) => (
            <div key={item.id} className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/50">Item {index + 1}</span>
                {invoiceData.lineItems.length > 1 && (
                  <button
                    onClick={() => removeLineItem(item.id)}
                    className="text-white/50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
              />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Rate</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Amount</label>
                  <div className="bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white/70">
                    ${(item.quantity * item.rate).toFixed(2)}
                  </div>
                </div>
              </div>
              {index < invoiceData.lineItems.length - 1 && (
                <div className="border-t border-white/5 mt-4 pt-2"></div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addLineItem}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-white/10 rounded-xl transition-all text-white/70 hover:text-white"
        >
          <Plus size={18} />
          <span>Add Item</span>
        </button>
      </section>

      {/* Tax and Notes */}
      <section className="bg-[#1c1c1e] rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-sm uppercase tracking-wider text-white/50 mb-3 block">Tax Rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={invoiceData.taxRate}
            onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
            className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all"
          />
        </div>
      </section>

      <section className="bg-[#1c1c1e] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-white/50 mb-3">Notes</h2>
        <textarea
          placeholder="Additional notes or payment terms..."
          value={invoiceData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={4}
          className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent transition-all resize-none"
        />
      </section>
    </div>
  );
}