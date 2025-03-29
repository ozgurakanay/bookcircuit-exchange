import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-green-900 text-amber-50">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-serif mb-4 text-yellow-50">Turtle Turning Pages</h3>
            <p className="text-amber-50/90 max-w-md mb-6">
              Connect with book lovers around you. Trade books you've read for ones you want to read.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-amber-50/80 hover:text-amber-50 transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-amber-50/80 hover:text-amber-50 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-amber-50/80 hover:text-amber-50 transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-amber-50/80 hover:text-amber-50 transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4 text-yellow-50">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-amber-50/80 hover:text-amber-50 transition-colors">About</a></li>
              <li><a href="#" className="text-amber-50/80 hover:text-amber-50 transition-colors">Careers</a></li>
              <li><Link to="/blog" className="text-amber-50/80 hover:text-amber-50 transition-colors">Blog</Link></li>
              <li><a href="#" className="text-amber-50/80 hover:text-amber-50 transition-colors">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4 text-yellow-50">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-amber-50/80 hover:text-amber-50 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-amber-50/80 hover:text-amber-50 transition-colors">Community</a></li>
              <li><Link to="/privacy-policy" className="text-amber-50/80 hover:text-amber-50 transition-colors">Privacy</Link></li>
              <li><Link to="/terms-of-service" className="text-amber-50/80 hover:text-amber-50 transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-yellow-50/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-amber-50/80 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Turtle Turning Pages. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-amber-50/80 hover:text-amber-50 text-sm transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-amber-50/80 hover:text-amber-50 text-sm transition-colors">Terms of Service</Link>
            <Link to="/cookie-policy" className="text-amber-50/80 hover:text-amber-50 text-sm transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
