import React from 'react'

type InputProps = {
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    placeholder?: string,
    type?: string,
    className?: string,
    disabled?: boolean,
    required?: boolean,
    minLength?: number
}

function Input({value, required, minLength, onChange, placeholder, type = "text", className = "", disabled = false, ...props} : InputProps) {
  return (
    <div>
      
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-6 py-3 pr-12  border border-gray-300 focus:outline-none text-lg font-semibold ${className}`}
        disabled={disabled}
        {...props}
        required={required}
        minLength={minLength}
      />
    </div>
  )
}

export default Input
