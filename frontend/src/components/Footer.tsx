
import { Shield, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">SecureSignal</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              AI-powered anonymous crime reporting platform ensuring your safety and privacy. 
              Help make your community safer with complete confidentiality.
            </p>
            <div className="flex space-x-4">
              <div className="bg-gray-800 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div className="bg-gray-800 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-blue-400" />
              </div>
              <div className="bg-gray-800 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/submit" className="hover:text-blue-400 transition-colors">
                  Submit Report
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-blue-400 transition-colors">
                  Track Report
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-blue-400 transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 SecureSignal. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            Powered by AI • Secured by Encryption
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;