import React from "react";

type InputProps = {
  label?: string;
  placeholder?: string;
  type?: string;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & React.InputHTMLAttributes<HTMLInputElement>;

function Input({
  label,
  placeholder,
  type = "text",
  className = "",
  disabled = false,
  value,
  onChange,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-6 py-3 pr-12 border border-gray-300 rounded-none  outline-none text-lg font-semibold ${className}`}
        disabled={disabled}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}

export default Input;
