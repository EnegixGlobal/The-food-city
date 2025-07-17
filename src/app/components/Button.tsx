import React from 'react'

type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
};

function Button({children, type="button", className="", onClick, ...props}: ButtonProps) {
  return (
    <button
      type={type}
      className={`bg-yellow-400 cursor-pointer hover:bg-yellow-500 text-red-800 font-bold md:px-5 md:py-2 px-3 py-1 rounded-full shadow-lg transition transform hover:scale-102 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
