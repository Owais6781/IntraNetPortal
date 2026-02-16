import * as React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-[#15162b] to-[#1b1c35] text-gray-300">
      
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-8 py-14 flex flex-cols-1 md:flex-cols-2 lg:flex-cols-4 gap-10">
        
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">GLOBEX</h2>
          <p className="text-sm leading-relaxed text-gray-400">
            Your central hub for collaboration, productivity, and
            organization news. Built for the modern workforce.
          </p>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-3 text-sm">
            <li className="hover:text-white cursor-pointer">About Us</li>
            <li className="hover:text-white cursor-pointer">News & Events</li>
            <li className="hover:text-white cursor-pointer">People Directory</li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-semibold mb-4">Support</h3>
          <ul className="space-y-3 text-sm">
            <li className="hover:text-white cursor-pointer">IT Helpdesk</li>
            <li className="hover:text-white cursor-pointer">HR Support</li>
            <li className="hover:text-white cursor-pointer">Policy Manuals</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact Noida HQ</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Sector 126, Noida, UP<br />
            Phone: +91 (120) 456-7890<br />
            Email: support@globex.com
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10"></div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 gap-4">
        <p>© 2026 Globex Corporation. All rights reserved.</p>

        <div className="flex gap-6">
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer">Terms of Service</span>
          <span className="hover:text-white cursor-pointer">Cookie Settings</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
