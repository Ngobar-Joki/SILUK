import React from "react";

interface ContactCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    contact: string;
    color: "blue" | "green" | "purple" | "orange";
}

const ContactCard: React.FC<ContactCardProps> = ({
    icon,
    title,
    description,
    contact,
    color,
}) => {
    const colorClasses = {
        blue: "bg-blue-100 text-blue-600",
        green: "bg-green-100 text-green-600",
        purple: "bg-purple-100 text-purple-600",
        orange: "bg-orange-100 text-orange-600",
    };

    const textColorClasses = {
        blue: "text-blue-600",
        green: "text-green-600",
        purple: "text-purple-600",
        orange: "text-orange-600",
    };

    return (
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div
                className={`w-16 h-16 ${colorClasses[color]} rounded-full flex items-center justify-center mx-auto mb-6`}
            >
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <p className={`${textColorClasses[color]} font-semibold`}>
                {contact}
            </p>
        </div>
    );
};

export default ContactCard;
