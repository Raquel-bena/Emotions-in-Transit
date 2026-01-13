import React from 'react';

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

export default EmotionCard;
