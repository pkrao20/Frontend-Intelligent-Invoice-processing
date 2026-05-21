import Link from "next/link";

const pages = [
  {
    href: "/upload",
    title: "Upload Invoice",
    description: "Upload a PDF, image, or JSON invoice for extraction and processing.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    color: "bg-blue-50 text-blue-600 border-blue-100",
    cta: "Upload →",
    ctaColor: "bg-blue-600 hover:bg-blue-700",
  },
  {
    href: "/reconcile",
    title: "Reconcile Invoice",
    description: "Match an uploaded invoice against purchase orders and detect anomalies.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    color: "bg-violet-50 text-violet-600 border-violet-100",
    cta: "Reconcile →",
    ctaColor: "bg-violet-600 hover:bg-violet-700",
  },
  {
    href: "/report",
    title: "View Report",
    description: "Fetch the full reconciliation report for any processed invoice.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    cta: "View Report →",
    ctaColor: "bg-emerald-600 hover:bg-emerald-700",
  },
];

const steps = [
  { number: "1", label: "Upload", desc: "Submit your invoice file or JSON data" },
  { number: "2", label: "Reconcile", desc: "Match the invoice against a PO" },
  { number: "3", label: "Report", desc: "Review the full reconciliation output" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <span className="inline-block bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
            Invoice Reconciliation
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Automate your invoice<br />reconciliation workflow
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Upload invoices, match them against purchase orders, and get detailed reconciliation reports — all in one place.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 w-full space-y-12">

        {/* How it works */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">How it works</h2>
          <div className="grid grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">
                  {step.number}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Page Cards */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Get started</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {pages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-gray-300 transition-all flex flex-col gap-4"
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${page.color}`}>
                  {page.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 mb-1">{page.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{page.description}</p>
                </div>
                <span className={`self-start text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all ${page.ctaColor}`}>
                  {page.cta}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
