import { GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-nobus-950 text-nobus-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-nobus-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">Nobus Cloud LMS</span>
            </div>
            <p className="text-sm leading-relaxed">
              Partner enablement platform for Nobus Cloud Services.
              Empowering partners with the knowledge to sell and deliver
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
