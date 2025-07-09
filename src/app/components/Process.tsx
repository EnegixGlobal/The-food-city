import React from 'react'
import Container from "./Container";

function Process() {

    const steps = [
    {
      title: "Fresh Pizza. Delivered.",
      description: "Choose Pizza",
      icon: "🍕",
      note: "User generated content will have multiple touchpoints for offshoring."
    },
    {
      title: "Delivery or Takeaway",
      icon: "🚚",
      description: "",
      note: "Nanotechnology immersion along the information will close the loop."
    },
    {
      title: "Enjoy Pizza",
      icon: "😋",
      description: "",
      note: "Praesent interdum mollis neque. In egestas nulla eget pede."
    }
  ];

  return (
    <div className="relative bg-gradient-to-r from-[#550000] to-red-900 text-white overflow-hidden">
  

      <Container>
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
          The Pizza Journey
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative bg-black/20 backdrop-blur-sm rounded-xl p-8 border border-maroon-600/30 hover:border-yellow-400/30 transition-all duration-300 hover:shadow-2xl"
            >
              {/* Step number */}
              <div className="absolute -top-5 -left-5 bg-yellow-400 text-maroon-900 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-maroon-800">
                {index + 1}
              </div>
              
              {/* Step icon */}
              <div className="text-6xl mb-6 text-center">{step.icon}</div>
              
              <h3 className="text-2xl font-bold mb-3 text-center text-yellow-400">
                {step.title}
              </h3>
              
              {step.description && (
                <p className="text-lg font-medium text-center mb-4">
                  {step.description}
                </p>
              )}
              
              <p className="text-maroon-100 text-center">
                {step.note}
              </p>
              
              {/* Connecting line (except last item) */}
              {index !== steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-12 w-12 h-1 bg-gradient-to-r from-yellow-400/50 to-transparent">
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-yellow-400"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-maroon-900 font-bold px-8 py-3 rounded-full shadow-lg transition transform hover:scale-105 text-lg">
            Order Your Pizza Now
          </button>
        </div>
      </Container>
    </div>
  )
}

export default Process
