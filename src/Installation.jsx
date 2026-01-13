import React from 'react';
import { Link } from 'react-router-dom';

const Installation = () => {
  return (
    <div className="min-h-screen bg-black text-white font-mono p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">INSTALLATION GUIDE</h1>
        <p className="text-gray-400">Technical specifications and setup instructions</p>
      </header>
      
      <div className="max-w-3xl mx-auto space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Hardware Requirements</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Projector (minimum 3000 lumens)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Audio system (5.1 surround recommended)</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              <span>Interaction sensors (optional)</span>
            </li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Software Setup</h2>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <code className="block">
              npm install<br/>
              npm run build<br/>
              npm run preview -- --port 10000
            </code>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Network Configuration</h2>
          <p className="text-gray-400">
            The installation requires a stable internet connection for real-time emotional data updates and audio streaming.
          </p>
        </section>
        
        <div className="text-center mt-12">
          <Link 
            to="/" 
            className="px-6 py-3 bg-gray-800 border border-gray-600 hover:bg-gray-700 transition-colors inline-block"
          >
            ← Back to Main
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Installation;
