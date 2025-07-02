import React from "react";

interface StatsCardProps {
    number: string;
    label: string;
    icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ number, label, icon }) => {
    return (
        <div className="text-center">
            <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
                {number}
            </div>
            <div className="text-gray-600">{label}</div>
        </div>
    );
};

export default StatsCard;
