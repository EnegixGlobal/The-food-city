

function Container({ children, className="" }) {
  return (
    <div className={`container mx-auto px-2 md:px-8 py-8 md:py-10 ${className}`}>
      {children}
    </div>
  )
}

export default Container
