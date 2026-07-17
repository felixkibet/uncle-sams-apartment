import Link from "next/link";

export default function TenantHomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/60">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Tenant Portal</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Welcome to Uncle Sam&apos;s Apartment</h1>
            <p className="mt-4 text-slate-600">Access your invoices, payment history, and important property details through your tenant portal.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "View Invoice",
                description: "Enter your invoice code to see details and download your invoice.",
                href: "/tenant/invoices",
              },
              {
                title: "Payment Help",
                description: "Find payment instructions and contact details for support.",
                href: "/tenant/help",
              },
            ].map((card) => (
              <Link key={card.title} href={card.href} className="rounded-3xl border border-slate-200 p-6 text-left hover:border-slate-300 hover:shadow-sm transition">
                <h2 className="text-xl font-semibold text-slate-900">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
