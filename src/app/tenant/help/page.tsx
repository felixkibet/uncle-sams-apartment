export default function TenantHelpPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/60">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Help Center</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">Payment & support</h1>
            <p className="mt-4 text-slate-600">Need assistance with your invoice? Here’s how to pay and who to contact.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Payment options</h2>
            <ul className="mt-4 space-y-3 text-slate-600">
              <li>• MPESA: Paybill <strong>123456</strong>, Account <strong>Invoice Number</strong></li>
              <li>• Cash: Deliver payment at the apartment office.</li>
              <li>• Bank Transfer: Use your invoice number as reference.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
            <p className="mt-4 text-slate-600">If you have questions about your bill or need help making a payment, contact us:</p>
            <div className="mt-4 space-y-3 text-slate-600">
              <p><strong>Phone:</strong> 0738 822 454</p>
              <p><strong>Email:</strong> unglesam@gmail.com</p>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-6 text-white">
            <h2 className="text-lg font-semibold">Quick tip</h2>
            <p className="mt-3 text-slate-200">Always use the invoice number as the payment reference so your payment can be matched automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
