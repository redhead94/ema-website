import React from "react";
import { Link } from "react-router-dom";
import { Heart, Mail, Phone } from "lucide-react";

const Footer = () => (
  <footer className="bg-white border-t border-slate-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-4 gap-8 text-sm">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
            <Heart className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="font-semibold tracking-tight">EMA</span>
        </div>
        <p className="mt-3 text-slate-600">A 501(c)(3) non‑profit. ❤️ </p>
      </div>
      <div>
        <p className="font-semibold mb-2">Get involved</p>
        <ul className="space-y-2 text-slate-600">
          <li>
            <Link 
              to="/donate" 
              className="hover:text-indigo-700 cursor-pointer transition-colors"
            >
              Donate
            </Link>
          </li>
          <li>
            <Link 
              to="/contact" 
              className="hover:text-indigo-700 cursor-pointer transition-colors"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <p className="font-semibold mb-2">Contact</p>
        <ul className="space-y-2 text-slate-600">
          <li className="flex items-center gap-2">
            <Mail className="h-4 w-4" aria-hidden="true"/> 
            info@essentialmom.net 
          </li>
          <li className="flex items-center gap-2">
            <Phone className="h-4 w-4" aria-hidden="true"/> 
            (301) 923-4815 
          </li>
        </ul>
      </div>
    </div>
    <div className="text-center text-xs text-slate-500 py-6">© 2025 EMA. All rights reserved.</div>
  </footer>
);

export default Footer;