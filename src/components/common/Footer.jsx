import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { label: 'Find Doctors', href: ROUTES.SEARCH_DOCTORS },
      { label: 'Book Appointments', href: ROUTES.BOOK_APPOINTMENT },
      { label: 'Health Records', href: ROUTES.MEDICAL_HISTORY }
    ],
    company: [
      { label: 'About Us', href: ROUTES.ABOUT },
      { label: 'Contact', href: ROUTES.CONTACT },
      { label: 'Careers', href: '/careers' }
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-blue rounded-lg p-2">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Medi-Link</span>
            </div>
            
            <p className="text-gray-300 mb-6 max-w-md">
              Connecting patients with healthcare providers for better, more accessible medical care. 
              Your health, our priority.
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-4 h-4 text-primary-blue" />
                <span className="text-sm">Emergency: 911 | Support: (555) 123-4567</span>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-4 h-4 text-primary-blue" />
                <span className="text-sm">support@medilink.com</span>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="w-4 h-4 text-primary-blue" />
                <span className="text-sm">123 Healthcare Ave, Medical City, MC 12345</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Emergency notice */}
      <div className="bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center space-x-2 text-center">
            <Heart className="w-5 h-5 text-white" />
            <span className="text-white font-medium text-sm">
              Medical Emergency? Call 911 immediately or use our Emergency Alert feature
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} Medi-Link. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Made with ❤️ for better healthcare</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Status: Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;