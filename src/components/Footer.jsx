export default function Footer() {
  return (
    <footer className="bg-nobus-950 text-nobus-300 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/nobus-logo.png" alt="Nobus Cloud Services" className="h-7 w-auto" />
              <span className="text-white font-bold">NCS PartnerCentral</span>
            </div>
            <p className="text-sm leading-relaxed">
              The partner portal for Nobus Cloud Services — enablement, sales,
              deal protection, quoting and resources for partners delivering
              Nigeria's sovereign cloud.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://nobus.io/documentation" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="https://cloud.nobus.io" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Cloud Console</a></li>
              <li><a href="https://nobus.io" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Nobus Website</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://nobus.io/compute" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Compute (FCS)</a></li>
              <li><a href="https://nobus.io/storage" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Storage (FBS/FOS)</a></li>
              <li><a href="https://nobus.io/networking" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Networking</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-nobus-800 mt-8 pt-6 text-center text-xs text-nobus-400">
          &copy; {new Date().getFullYear()} Nobus Cloud Services (Nkponani Limited). All rights reserved. |
          Partner Use Only | Confidential
        </div>
      </div>
    </footer>
  );
}
