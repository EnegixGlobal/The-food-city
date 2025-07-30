import React from "react";

type InputProps = {
  placeholder?: string;
  type?: string;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Input({
  placeholder,
  type = "text",
  className = "",
  disabled = false,
  value,
  onChange,
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full px-6 py-3 pr-12  border border-gray-300 focus:outline-none text-lg font-semibold ${className}`}
      disabled={disabled}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

export default Input;
