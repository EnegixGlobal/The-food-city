import React from 'react'

type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
};

function Button({children, type="button", className="", ...props}: ButtonProps) {
  return (
    <button
      type={type}
      className={`bg-yellow-400 cursor-pointer hover:bg-yellow-500 text-red-800 font-bold md:px-4 md:py-1 px-3 py-1 rounded-full shadow-lg transition transform hover:scale-102 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
