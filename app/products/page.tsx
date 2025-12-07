import React from 'react'
import Navbar from '../navbar/navbar'

export default function page() {
  return (
 <div
 >
            <Navbar/>

       <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold md:mt-[100px]  mb-4">Products Coming Soon!</h1>
      <p className="text-xl text-gray-600 mb-6">
        We are working hard to bring you an exciting range of digital products.
        Stay tuned for updates.
      </p>
      <div className="bg-gray-100 p-6 rounded-lg max-w-md mx-auto">
        <p className="italic text-gray-500">
          My Digital product catalog is currently under development. 
          Check back soon for amazing digital downloads, services, 
          and consultations.
        </p>
      </div>
    </div>
 </div>
  )
}
