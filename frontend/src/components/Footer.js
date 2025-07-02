import React from 'react';
import { Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Mail className="h-6 w-6 text-blue-400" />
            <span className="font-semibold text-lg">Newsletter App</span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-400" />
            <span>using React & Node.js</span>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; 2025 Newsletter App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
