"use client";

import Image from "next/image";
import React from "react";

interface AuthContainerProps {
  children: React.ReactNode;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  return (
    <>
      <header className="bg-white shadow-md ">
        <div className="container mx-auto flex justify-center items-center p-6">
          <Image
            src="/logo.png"
            alt="Company Logo"
            width={90}
            height={90}
            className="w-50 h-50 rounded"
          />
          <div className="text-2xl ms-3 font-bold text-gray-800">
            Cuisine Cart
          </div>
        </div>
      </header>
      {children}
    </>
  );
};

export default AuthContainer;
