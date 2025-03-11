// app/chef/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import Image from "next/image";

export default function ChefProfilePage() {
  const [userData, setUserData] = useState<any>(null); // To store user data
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get("/api/auth/session"); // Fetch user data from session
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/auth/login"); // Redirect to login page if there's an error (unauthorized)
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>No user data found</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#FFF6EC] p-4">
      {/* Orange Container */}
      <div className="relative w-full max-w-5xl mt-24 sm:mt-32 mb-6 sm:mb-9 bg-[#f4ad74] rounded-[30px] pb-6 px-6 sm:px-12 md:px-24 flex flex-col items-center">
        
        {/* Profile Icon */}
        <div className="absolute -top-12 sm:-top-16 left-4 sm:left-6 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
          <Image src="/icons/user-icon.svg" alt="Profile Icon" className="w-12 h-12 sm:w-16 sm:h-16 p-2" />
        </div>
  
        {/* Profile Name */}
        <h2 className="absolute -top-6 sm:-top-8 left-32 sm:left-40 text-lg sm:text-2xl md:text-3xl font-semibold">
          {userData.name}
        </h2>
  
        {/* Rating & Cuisine Type */}
        <div className="mt-10 flex absolute -top-4 sm:-top-6 left-32 sm:left-40 gap-2 text-sm sm:text-lg">
          <span className="font-medium">Rating:</span>
          <div className="flex">
            <span className="text-yellow-400 text-lg sm:text-xl">★</span>
            <span className="text-yellow-400 text-lg sm:text-xl">★</span>
            <span className="text-yellow-400 text-lg sm:text-xl">★</span>
            <span className="text-gray-400 text-lg sm:text-xl">★</span>
            <span className="text-gray-400 text-lg sm:text-xl">★</span>
          </div>
          <span className="ml-2 font-medium">| Cuisine Type</span>
        </div>
  
        {/* Buttons Section */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mt-20">
          <button className="bg-white px-6 sm:px-10 py-6 sm:py-10 rounded-lg shadow-md font-medium w-full sm:w-auto">Recipes</button>
          <button className="bg-white px-6 sm:px-10 py-6 sm:py-10 rounded-lg shadow-md font-medium w-full sm:w-auto">Earnings</button>
          <button className="bg-white px-6 sm:px-9 py-6 sm:py-10 rounded-lg shadow-md font-medium w-full sm:w-auto">Subscribers</button>
        </div>
  
        {/* Profile Card Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full mt-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4">Chef Profile</h2>
  
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <Label className="block">Name</Label>
              <div className="flex items-center p-2">
                <Input value={userData.name} readOnly className="w-full outline-none bg-transparent border border-[#FF9A1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <Pencil className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700 ml-2" />
              </div>
            </div>
  
            {/* Email Field */}
            <div>
              <Label className="block">Email</Label>
              <div className="flex items-center">
                <Input value={userData.email} readOnly className="w-full outline-none bg-transparent border border-[#FF9A1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <Pencil className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700 ml-2" />
              </div>
            </div>
  
            {/* Role Field (Non-editable) */}
            <div>
              <Label className="block">Role</Label>
              <Input value={userData.role} readOnly className="w-full p-2 border border-[#FF9A1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
  
            {/* Other Editable Fields */}
            {["Bio", "Experience", "Special Dishes", "Age", "Phone", "Address"].map((field, index) => (
              <div key={index}>
                <Label className="block">{field}</Label>
                <div className="flex items-center">
                  <Input placeholder={field} className="w-full outline-none bg-transparent border border-[#FF9A1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <Pencil className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700 ml-2" />
                </div>
              </div>
            ))}
          </div>
  
          {/* Edit Profile Button */}
          <div className="flex justify-center mt-4">
            <button className="bg-orange-500 text-white px-8 sm:px-14 py-2 rounded-md hover:bg-orange-600">EDIT</button>
          </div>
        </div>
  
        {/* Achievements Section */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full mt-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-center">Achievements</h2>
        </div>
      </div>
    </div>
  );
  }
