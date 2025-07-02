import React from "react";

interface InputProps {
    label?: string;
    type?: "text" | "email" | "password" | "number" | "tel";
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    className = "",
    icon,
}) => {
    const inputClasses = `
    w-full px-4 py-3 border rounded-lg transition-colors duration-200
    ${
        error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-300 focus:border-blue-500"
    }
    ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
    ${icon ? "pl-12" : ""}
    focus:outline-none focus:ring-2 focus:ring-blue-500/20
  `;

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}{" "}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    className={inputClasses.trim()}
                />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default Input;
