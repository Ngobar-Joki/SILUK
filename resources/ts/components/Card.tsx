import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: "sm" | "md" | "lg";
    shadow?: "sm" | "md" | "lg" | "xl";
    hover?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    className = "",
    padding = "md",
    shadow = "md",
    hover = false,
}) => {
    const baseClasses = "bg-white rounded-xl border border-gray-100";

    const paddingClasses = {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
    };

    const shadowClasses = {
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
    };

    const hoverClasses = hover
        ? "hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        : "";

    return (
        <div
            className={`${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${hoverClasses} ${className}`}
        >
            {children}
        </div>
    );
};

export default Card;
