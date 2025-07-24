
import Image from 'next/image'
import React from 'react'

function Spinner({ className = ""}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/spinner.svg"
        alt="Loading..."
        width={24}
        height={24}
      />
    </div>
  )
}

export default Spinner
