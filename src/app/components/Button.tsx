import React from 'react'

type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function Button({children,  type="button", className="", onClick, disabled = false, ...props}: ButtonProps) {
  return (
    <button
      type={type}
      className={`bg-yellow-400 cursor-pointer hover:bg-yellow-500 text-red-800 font-bold md:px-5 md:py-2 px-3 py-1 rounded-full shadow-lg transition transform hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
