import React from 'react'

function page() {
  return (
  <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Shipping Policy</h1>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p>
Orders are delivered within 1-4 hours from the time of the order and/or payment or as per the delivery date agreed at the time of order confirmation and delivering of the shipment.
          </p>
        </div>
      </div>
    </div>
  )
}

export default page
