import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { emotionMap, emotionalParameters } from './utils/emotionConfig';

const App = () => {
  const [entropy, setEntropy] = useState(emotionalParameters.entropy.default);
  const [vector, setVector] = useState(emotionalParameters.vector.default);
  const [metabolism, setMetabolism] = useState(emotionalParameters.metabolism.default);

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <header className="p-8 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-red-600">EMOTIONS IN TRANSIT</h1>
          <p className="text-gray-500 text-sm">v1.0.4 // BARCELONA METRO DATA VISUALIZATION</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600 uppercase">System Status</div>
          <div className="text-green-500 animate-pulse text-sm">● LIVE FEED ACTIVE</div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <MetricCard 
            title="[!] ENTROPY" 
            subtitle="System Disorder / Noise" 
            value={entropy.toFixed(2)} 
            color="#FF0000" 
          />
          <MetricCard 
            title="→ VECTOR" 
            subtitle="Wind Direction / Alignment" 
            value={`${vector.toFixed(0)}°`} 
            color="#008000" 
          />
          <MetricCard 
            title="[+] METABOLISM" 
            subtitle="Mobility / Update Rate" 
            value={metabolism.toFixed(2)} 
            color="#FFFF00" 
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Emotional Mapping</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(emotionMap).map(([emotion, config]) => (
              <EmotionCard 
                key={emotion} 
                emotion={emotion} 
                color={config.color} 
                line={config.line} 
              />
            ))}
          </div>

          <div className="mt-12 text-center pt-10">
            <Link 
              to="/visualization" 
              className="px-10 py-5 bg-white text-black font-bold rounded-sm hover:bg-red-600 hover:text-white transition-all inline-block border-2 border-white"
            >
              INITIALIZE 3D VISUALIZATION
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

const MetricCard = ({ title, subtitle, value, color }) => (
  <div className="p-6 bg-gray-900 border border-gray-800 rounded-sm">
    <h3 className="text-xs font-bold mb-1" style={{ color }}>{title}</h3>
    <p className="text-[10px] text-gray-500 mb-4 uppercase">{subtitle}</p>
    <div className="text-4xl font-light tracking-tighter">{value}</div>
  </div>
);

const EmotionCard = ({ emotion, color, line }) => (
  <div className="p-4 bg-gray-900 border-l-2" style={{ borderColor: color }}>
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-xs font-bold uppercase">{emotion}</h4>
        <p className="text-[10px] text-gray-500">Route: {line}</p>
      </div>
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
    </div>
  </div>
);

export default App;
