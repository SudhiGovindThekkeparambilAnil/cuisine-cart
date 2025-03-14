"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Title from "../../components/content/Title";

export default function UserSelection() {
  const router = useRouter();

  const handleRoleSelection = (role: string) => {
    localStorage.setItem("role", role);
    router.push(`/auth/login?role=${role}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#FFF6EC] px-6 py-12">
      {/* Logo & Title */}
      <div className="absolute top-12 mt-6 flex flex-col items-center">
        <Image src="/logo.png" alt="Cuisine Cart Logo" width={70} height={70} />
        <h1 className="text-black text-2xl sm:text-3xl font-bold mt-3">
          CUISINE <span className="text-orange-400">CART</span>
        </h1>
      </div>
      <Title text="Choose who you are" className="mt-48 md:mt-48 lg:mt-28" />

      {/* Role Selection Cards */}
      <div className="mt-8 md:mt-9 lg:mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-lg sm:max-w-xl md:max-w-3xl">
        {/* First Two Cards - Side by Side in Tablet */}
        <div className="flex justify-center">
          <div
            onClick={() => handleRoleSelection("chef")}
            className="p-5 bg-gradient-to-r from-[#ffa53c] to-[#ff6a13] rounded-2xl shadow-lg flex flex-col items-center justify-center border-2 border-black cursor-pointer transition-transform transform hover:scale-105 sm:hover:scale-110 
                      w-full max-w-[200px] md:max-w-[230px] lg:max-w-none mx-auto"
          >
            <Image src="/chef_hat.png" alt="Chef Icon" width={40} height={40} />
            <p className="mt-2 text-base sm:text-lg font-semibold text-black">
              I’m a Chef
            </p>
            <p className="text-xs sm:text-sm text-gray-700 mt-2 text-center">
              Create delicious dishes.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <div
            onClick={() => handleRoleSelection("diner")}
            className="p-5 bg-gradient-to-r from-[#ffa53c] to-[#ff6a13] rounded-2xl shadow-lg flex flex-col items-center justify-center border-2 border-black cursor-pointer transition-transform transform hover:scale-105 sm:hover:scale-110 
                      w-full max-w-[200px] md:max-w-[230px] lg:max-w-none mx-auto"
          >
            <Image
              src="/food_bar.png"
              alt="Diner Icon"
              width={40}
              height={40}
            />
            <p className="mt-2 text-base sm:text-lg font-semibold text-black">
              I’m a Diner
            </p>
            <p className="text-xs sm:text-sm text-gray-700 mt-2 text-center">
              Purchase your favorite cuisines.
            </p>
          </div>
        </div>

        {/* Third Card - Centered Below Only in Tablet */}
        <div className="md:col-span-2 lg:col-span-1 flex justify-center md:mt-8 lg:mt-0">
          <div
            onClick={() => handleRoleSelection("driver")}
            className="p-5 bg-gradient-to-r from-[#ffa53c] to-[#ff6a13] rounded-2xl shadow-lg flex flex-col items-center justify-center border-2 border-black cursor-pointer transition-transform transform hover:scale-105 sm:hover:scale-110 
                      w-full max-w-[200px] md:max-w-[230px] lg:max-w-none mx-auto"
          >
            <Image src="/car.png" alt="Driver Icon" width={40} height={40} />
            <p className="mt-2 text-base sm:text-lg font-semibold text-black">
              I’m a Driver
            </p>
            <p className="text-xs sm:text-sm text-gray-700 mt-2 text-center">
              Deliver orders to customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
