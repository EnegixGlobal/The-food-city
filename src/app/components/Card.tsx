import React from "react";

function Card({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full md:max-w-[230px] max-w-[220px] 
                 
                  flex-shrink-0 
                  bg-white rounded-xl shadow-md overflow-hidden 
                  hover:shadow-xl transition-all duration-300 
                  ${className}`}
      {...props}>
      {children}
    </div>
  );
}

export default Card;
