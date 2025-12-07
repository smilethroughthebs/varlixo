'use client';

/**
 * ==============================================
 * VARLIXO - FOOTER COMPONENT
 * ==============================================
 */

import Link from 'next/link';
import { Mail, Phone, MapPin, Twitter, Linkedin, Github, Send } from 'lucide-react';

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Investment Plans', href: '/plans' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Careers', href: '/careers' },
  ],
  support: [
    { label: 'Help Center', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Support', href: '/support' },
    { label: 'System Status', href: '/status' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Risk Disclosure', href: '/risk' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-2xl font-bold text-white">Varlixo</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              The future of intelligent investing. Secure, scalable, and built for growth. Start your investment journey today.
            </p>
            <div className="space-y-3">
              <a
                href="mailto:support@varlixo.com"
                className="flex items-center gap-3 text-gray-400 hover:text-primary-500 transition-colors"
              >
                <Mail size={18} />
                support@varlixo.com
              </a>
              <a
                href="tel:+14083600362"
                className="flex items-center gap-3 text-gray-400 hover:text-primary-500 transition-colors"
              >
                <Phone size={18} />
                +1 408 360 0362
              </a>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin size={18} />
                45 City Plaza, Berlin 10117, Germany
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Varlixo. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all"
              >
                <Github size={18} />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all"
              >
                <Send size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}



