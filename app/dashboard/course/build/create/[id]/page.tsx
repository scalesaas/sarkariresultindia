"use client"
import React from 'react'
import ModuleForm from '../../../compoennts/Module_form'
import { useParams } from 'next/navigation'


function page( { params }: { params: { id: string } }) {
  return (
   <div className="min-h-screen bg-gray-50">
      {/* Header spacing and container */}
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Module Configuration
            </h1>
            <p className="text-gray-600">
              Configure your module settings and preferences
            </p>
          </div>

          {/* Main content area */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <ModuleForm id={params.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page