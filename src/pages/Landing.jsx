import { Link } from 'react-router-dom';
import {
  LogIn, ArrowRight, Server, HardDrive, Network, ShieldCheck, Container, Database,
  GraduationCap, Compass, Calculator, Megaphone, FlaskConical, BadgePercent, Award, CheckCircle,
} from 'lucide-react';

const SERVICES = [
  { icon: Server, name: 'Compute', desc: 'FCS instances, dedicated hosting, autoscaling and CloudOrchestration - from ₦9,309/month.' },
  { icon: HardDrive, name: 'Storage & Backup', desc: 'FBS block volumes, unlimited FOS object storage and Acronis-powered Cloud Backup.' },
  { icon: Network, name: 'Networking', desc: 'Virtual data centers, Fast Transit, floating IPs, VPN, DNS, firewalls and load balancing.' },
  { icon: ShieldCheck, name: 'Security', desc: 'Sophos XG, FortiGate NGFW and Acronis Cyber Protect on ISO 27001 / PCI DSS-ready infrastructure.' },
  { icon: Container, name: 'Containers', desc: 'Managed Kubernetes, cloud containers and Kafka event streaming.' },
  { icon: Database, name: 'Databases', desc: 'Managed PostgreSQL, MySQL, MSSQL and MongoDB with HA and automated failover.' },
];

const MODULES = [
  { icon: GraduationCap, name: 'Training Academy', desc: 'Role-based enablement for Sales, Presales and Technical engineers, with quizzes and certifications.' },
  { icon: ShieldCheck, name: 'Deal Registration', desc: 'Register opportunities for 90-day channel protection with conflict detection.' },
  { icon: Calculator, name: 'Quote Builder', desc: 'Customer-ready Naira quotes from the live Nobus catalog, exportable to PDF and Excel.' },
  { icon: Compass, name: 'Sales Navigator', desc: 'Kanban pipeline, activity tracking and weighted revenue forecasting.' },
  { icon: Megaphone, name: 'Marketing & Content', desc: 'Brochures, battle cards, whitepapers, datasheets and co-branded campaign kits.' },
  { icon: FlaskConical, name: 'Demo Labs', desc: 'Guided sandbox scenarios with a booking calendar for presales engagements.' },
];

const BENEFITS = [
  { icon: BadgePercent, title: 'Exclusive Partner Pricing', desc: 'Access preferential partner rates on compute and storage for every registered deal, per the Partner Agreement.' },
  { icon: ShieldCheck, title: 'Protected Deals', desc: 'Registered opportunities are shielded from channel conflict for 90 days.' },
  { icon: Award, title: 'Certification & Tiers', desc: 'Certify your team and climb from Registered to Platinum with growing benefits.' },
  { icon: Calculator, title: 'Your Own Fees', desc: 'Charge setup and recurring managed-services fees on top - your pricing, your margin.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="bg-nobus-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/nobus-logo.png" alt="Nobus Cloud Services" className="h-8 w-auto" />
            <span className="hidden sm:block text-sm text-white uppercase tracking-[0.14em] font-extrabold border-l border-nobus-800 pl-3">
              PartnerCentral
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-nobus-800 transition-colors">
              <LogIn className="w-4 h-4" /> Login
            </Link>
            <Link to="/register" className="btn-primary !py-2 text-sm">
              Become a Partner
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-nobus-950 text-white relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-40 -right-40 w-[560px] h-[560px] bg-nobus-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-56 left-1/3 w-[480px] h-[480px] bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Copy */}
            <div>
              <div className="badge bg-nobus-800 text-nobus-200 mb-5">Nobus Cloud Services Partner Network</div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                Build a cloud business on <span className="text-nobus-400">Nigeria's sovereign cloud</span>
              </h1>
              <p className="text-lg text-nobus-200 leading-relaxed mb-8">
                Nobus PartnerCentral is the one portal for everything you do with Nobus Cloud - enablement and
                certification, deal registration with channel protection, Naira quoting, pipeline management,
                demo labs and campaign-ready marketing content.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base !px-7 !py-3">
                  Become a Partner <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors">
                  <LogIn className="w-4 h-4" /> Partner Login
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-10 text-sm text-nobus-300">
                {['Naira billing, zero FX risk', 'Tier III data centers across Africa', 'NDPR · ISO 27001 · PCI DSS'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-nobus-400" /> {t}</span>
                ))}
              </div>
            </div>

            {/* Portal preview composition */}
            <div className="hidden lg:block relative">
              {/* Main dashboard card */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 text-gray-900 relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-xs text-gray-400">Acme Technologies Ltd · NBS-NG-2026-001</div>
                    <div className="font-bold text-lg">Partner Dashboard</div>
                  </div>
                  <span className="badge bg-nobus-50 text-nobus-700 font-bold">Gold Tier</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Open Pipeline', value: '₦7.6M' },
                    { label: 'Forecast', value: '₦10.2M' },
                    { label: 'Protected Deals', value: '4' },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                      <div className="text-lg font-bold text-gray-900">{s.value}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: 'Core banking migration', status: 'Protected', cls: 'badge-green', val: '₦4.5M' },
                    { name: 'Health records platform', status: 'Pending', cls: 'badge-amber', val: '₦12M' },
                    { name: 'Retail e-commerce stack', status: 'Won', cls: 'badge-green', val: '₦6.8M' },
                  ].map((d) => (
                    <div key={d.name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                      <div className="text-sm font-medium text-gray-800">{d.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{d.val}</span>
                        <span className={d.cls}>{d.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating benefit cards */}
              <div className="absolute -top-6 -right-4 z-20 bg-nobus-500 text-white rounded-xl shadow-xl px-5 py-4">
                <div className="flex items-center gap-2">
                  <BadgePercent className="w-5 h-5" />
                  <div>
                    <div className="font-extrabold leading-tight">Exclusive Partner Pricing</div>
                    <div className="text-[10px] text-nobus-100">on every registered deal</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 z-20 bg-white rounded-xl shadow-xl px-5 py-4 text-gray-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-extrabold leading-tight">90-Day Protection</div>
                    <div className="text-[10px] text-gray-400">channel-conflict shield</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 -right-10 z-0 w-40 h-40 bg-nobus-500/30 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Why partner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Why partner with Nobus?</h2>
          <p className="text-gray-500">
            Nigerian businesses are moving to local cloud for data sovereignty, Naira budgeting and local support.
            Partners are how they get there - and the program pays you for it.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card p-6 text-center">
              <div className="w-12 h-12 bg-nobus-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <b.icon className="w-6 h-6 text-nobus-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5">{b.title}</h3>
              <p className="text-sm text-gray-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portal modules */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything a partner needs, in one portal</h2>
            <p className="text-gray-500">From first training to closed deal - PartnerCentral covers the whole journey.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((m) => (
              <div key={m.name} className="card p-6">
                <div className="w-10 h-10 bg-nobus-500 rounded-lg flex items-center justify-center mb-4">
                  <m.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{m.name}</h3>
                <p className="text-sm text-gray-500">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you'll sell */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">The catalog you'll sell</h2>
          <p className="text-gray-500">
            A complete cloud platform hosted in Tier III-certified data centers across Africa, priced in Naira, pay-as-you-use.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <div key={s.name} className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:border-nobus-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-nobus-50 rounded-lg flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-nobus-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{s.name}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-nobus-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to build with Nobus?</h2>
          <p className="text-nobus-200 mb-8 max-w-xl mx-auto">
            Apply in minutes. Once approved, your team gets full access to training, deal registration,
            quoting and every partner resource.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base !px-7 !py-3">
              Become a Partner <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors">
              Partner Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-nobus-950 border-t border-nobus-900 text-nobus-400 text-xs text-center py-6">
        © {new Date().getFullYear()} Nobus Cloud Services (Nkponani Limited) · <a href="https://nobus.io" target="_blank" rel="noreferrer" className="hover:text-white">nobus.io</a> · <Link to="/terms" className="hover:text-white">Partner Terms &amp; Conditions</Link>
      </footer>
    </div>
  );
}
