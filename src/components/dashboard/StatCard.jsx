import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass, trend, borderForce }) => {
    return (
        <div className={`
            bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between 
            hover:shadow-lg transition-all
            ${borderForce ? `border-l-4 ${borderForce}` : ''}
        `}>
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        {trend}
                    </span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</p>
                <h4 className="text-2xl font-black text-gray-900 mt-1">{value}</h4>
            </div>
        </div>
    );
};

export default StatCard;
