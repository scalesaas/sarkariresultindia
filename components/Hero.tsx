"use client"
import React from 'react';
import Navbar from '@/app/navbar/navbar';
import Image from 'next/image';
import hardware from "../public/hardware.png"
export default function Hero() {
  return (
    <div className="relative  md:pt-0 ">
      <Image
      src={hardware}
      alt='hardware garage image'
      >

      </Image>
      <div className="absolute inset-0  bg-gradient-to-b from-transparent to-black/60 flex items-center justify-center">

        <div className="text-center text-white">
          <h1 className="md:text-8xl md:pt-0 mt-[50px] text-3xl font-bold mb-4">Stay curious.</h1>
          <p className="md:text-2xl  text-sm font-medium mb-2 md:mb-8">
           Discover hardware and Robotics  <br /> passion of Engineering.
          </p>
          <button className="bg-black text-white md:px-6 md:py-3 px-1 py-1 rounded-full md:font-medium font-small text-sm hover:bg-gray-800">
            Start reading
          </button>
        </div>
      </div>
    </div>
  );
}