
import Image from 'next/image'
import React from 'react'

function Spinner({ className = "", h=24, w=24 }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/spinner.svg"
        alt="Loading..."
        width={h}
        height={w}
      />
    </div>
  )
}

export default Spinner
