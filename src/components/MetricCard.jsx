import React from 'react';

const MetricCard = ({ title, subtitle, value, color }) => (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-sm">
        <h3 className="text-xs font-bold mb-1" style={{ color }}>{title}</h3>
        <p className="text-[10px] text-gray-500 mb-4 uppercase">{subtitle}</p>
        <div className="text-4xl font-light tracking-tighter">{value}</div>
    </div>
);

export default MetricCard;
