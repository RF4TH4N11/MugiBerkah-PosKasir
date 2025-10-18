import React from "react";

interface InputProps {
  id: string;
  name: string;
  type?: string;
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  name,
  type = "text",
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`mb-3 sm:mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
        } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          disabled
            ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        } transition-colors`}
      />
      {error && <p className="mt-1 text-xs sm:text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
