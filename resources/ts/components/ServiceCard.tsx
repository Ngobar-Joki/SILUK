import React from "react";

interface ServiceCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    features: string[];
    onLearnMore?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
    icon,
    title,
    description,
    features,
    onLearnMore,
}) => {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100">
            <div className="mb-6">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 mb-6">{description}</p>
            <ul className="space-y-2 mb-6">
                {features.map((feature, index) => (
                    <li
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                    >
                        <svg
                            className="w-4 h-4 text-green-500 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {feature}
                    </li>
                ))}
            </ul>
            <button
                onClick={onLearnMore}
                className="w-full bg-gray-50 text-gray-700 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
                Pelajari Lebih Lanjut
            </button>
        </div>
    );
};

export default ServiceCard;
