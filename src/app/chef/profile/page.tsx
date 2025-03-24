  // const [userData, setUserData] = useState<any>(null); // To store user data

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const res = await axios.get("/api/auth/session"); // Fetch user data from session
  //       setUserData(res.data);
  //     } catch (error) {
  //       console.error("Error fetching user data:", error);
  //       router.push("/auth/login"); // Redirect to login page if there's an error (unauthorized)
  //     } finally {
  //       setLoading(false);

"use client";

import React, { useState, useEffect } from "react";
import Accordion from "@/components/ui/Accordion";
import EditableField from "@/components/ui/EditableField";
import AddAddressModal from "@/components/ui/AddAddressModal";
import { Rating } from "@/components/ui/rating";
import Image from "next/image";
import axios from "axios";
import { FaPencilAlt } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import UploadImage from "@/components/core/UploadImage/UploadImage";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Define frontend interfaces
interface IAddress {
  type: string;
  buildingNumber: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  _id?: string;
}

interface IUser {
  name: string;
  email: string;
  role: string;
  addresses: IAddress[];
  cuisineType?: string;
  cuisineSpecialties?: string[];
  yearsOfExperience?: number;
  profileImage?: string;
}

export default function ChefProfile() {
  const [user, setUser] = useState<IUser>({
    name: "",
    email: "",
    role: "",
    addresses: [],
    cuisineType: "",
    cuisineSpecialties: [],
    yearsOfExperience: 0,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // const router = useRouter();

  useEffect(() => {
    setIsMounted(true); // Prevents hydration error
  }, []);


  const handleEditChefInfo = async (field: string, value: string | number | string[]) => {
    await fetch("/api/profile/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ [field]: value }),
    });

    setUser((prev) => ({ ...prev, [field]: value }));
  };
  

  useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data: IUser = await response.json();
        setUser(data);
        console.log("User:", user);
      } else {
        console.log("Error fetching user profile:", response.statusText);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);
  

  async function handleImageUpload(url: string) {
    try {
      const res = await axios.patch("/api/user/update", { profileImage: url });

      if (res.status === 200) {
        setUser((prev: any) => ({ ...prev, profileImage: url }));
      } else {
        alert("Failed to update profile image.");
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
      alert("Something went wrong.");
    }
  }

  if (loading) {
    return <Loader />; // Show the loader component while loading
  }
  const handleEditName = async (newName: string) => {
    await fetch("/api/profile/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName }),
    });
    setUser((prev) => ({ ...prev, name: newName }));
  };

  const handleAddAddress = async (address: IAddress) => {
    const response = await fetch("/api/profile/add-address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(address),
    });

    if (response.ok) {
      const updatedUser: IUser = await response.json();
      setUser(updatedUser); // Update user state with new data from backend
      setShowModal(false);// Update user state with new data from backend
    } else {
      console.log("Error adding address:", await response.json());
    }
  };

  const handleEditAddress = (address: IAddress) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleSaveEditedAddress = async (updatedAddress: IAddress) => {
    const response = await fetch("/api/profile/update-address", {

      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedAddress),
    });

    if (response.ok) {
      setUser((prevUser) => ({
        ...prevUser,
        addresses: prevUser.addresses.map((addr) =>
          addr._id === updatedAddress._id ? updatedAddress : addr
        ),
      }));
    } else {
      console.log("Error updating address:", await response.json());
    }

    setShowModal(false);
    setEditingAddress(null);
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setPasswordError("Token is missing or expired");
      return;
    }
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({token, password: newPassword }),
    });

    if (response.ok) {
      setResetSuccess(true); // Show success box
      setShowPasswordReset(false);// Hide the reset form after successful change
    } else {
      console.log("Error resetting password:", await response.json());
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF6EC] flex justify-center items-center p-6">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
        {/* Profile Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-gray-300">
          <div>
            <h1 className="text-2xl font-bold text-[#000000] uppercase">{user.name}</h1>
            <Rating value={3} className="mt-1" />
            <p className="text-[#333333] mt-1">{user.cuisineType || "Cuisine Type"}</p>
          </div>
          {/* <div className="w-16 h-16 bg-gray-300 rounded-full"></div> */}
          {/* Profile Icon */}
            {isMounted && (
              <div className="absolute -top-12 sm:-top-16 left-4 sm:left-6 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                  />
                ) : (
                  <Image
                    src="/icons/user-icon.svg"
                    alt="Default Profile"
                    width={128}
                    height={128}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full"
                  />
                )}
              </div>
            )}
            <div className="mt-8">
              Upload Profile Image
            <UploadImage onUploadComplete={handleImageUpload} />
        </div>

        </div>

    <div className="mt-4">
      <Accordion title="Personal Details">
      <div className="p-4 bg-white">
        <EditableField label="Name" value={user.name} isEditable onSave={handleEditName} />
        <EditableField label="Email" value={user.email} isEditable={false} onSave={() => {}} />
        <EditableField label="Role" value={user.role} isEditable={false} onSave={() => {}} />

        <div className="mt-4">
          <h3 className="block">Addresses:</h3>
          {user.addresses.length > 0 ? (
            user.addresses.map((address, index) => (
              <div key={index} className="border border-[#FFC487] p-2 mt-2 rounded-md flex justify-between items-center">
                <div>
                  <p><strong>Type:</strong> {address.type}</p>
                  <p><strong>Building Number:</strong> {address.buildingNumber}</p>
                  <p><strong>Street:</strong> {address.street}</p>
                  <p><strong>City:</strong> {address.city}</p>
                  <p><strong>State:</strong> {address.state}</p>
                  <p><strong>Postal Code:</strong> {address.postalCode}</p>
                  <p><strong>Country:</strong> {address.country}</p>
                  <p><strong>Phone Number:</strong> {address.phoneNumber}</p>
                </div>
                <FaPencilAlt
                            className="text-[#333333] cursor-pointer"
                            onClick={() => handleEditAddress(address)}
                          />
              </div>
            ))
          ) : (
            <p>No addresses added yet.</p>
          )}
          <button onClick={() => setShowModal(true)} className="text-[#F39C12]">
            Add Address
          </button>
        </div>
        </div>
      </Accordion>

      {/* New Chef Information Accordion */}
          <Accordion title="Chef Information">
            <div className="p-4 bg-white">
              <EditableField label="Cuisine Type" value={user.cuisineType || ""} isEditable onSave={(value) => handleEditChefInfo("cuisineType", value)} />
              <EditableField
                label="Cuisine Specialties"
                value={user.cuisineSpecialties?.join(", ") || ""}
                isEditable
                onSave={(value) => handleEditChefInfo("cuisineSpecialties", value.split(",").map((s) => s.trim()))}
              />
              <EditableField
                label="Years of Experience"
                value={user.yearsOfExperience?.toString() || ""}
                isEditable
                onSave={(value) => handleEditChefInfo("yearsOfExperience", Number(value))}
              />
            </div>
          </Accordion>

       {/* Account and Security Accordion */}
       <Accordion title="Account and Security">
        <h1 className="font-semibold text-lg">Account & Security</h1>
        <p>
        Here you can update your account password and strengthen your security of your account.
        </p>
        <button
          onClick={() => setShowPasswordReset(true)}
          className="text-[#F39C12] mt-2"
        >
          Set New Password
        </button>

        {showPasswordReset && (
          <div className="mt-4">
             {/* New Password Field */}
                        <div className="relative">
                          <Label className="block">New Password</Label>
                          {/* Password Icon (Left) */}
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Image
                              src="/icons/password.svg"
                              alt="Password Icon"
                              width={22}
                              height={22}
                              className="filter invert-0 brightness-0"
                            />
                          </span>
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            className="border p-3 pl-12 pr-12 rounded mt-2 w-full"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <span
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            <Image
                              src={
                                showNewPassword
                                  ? "/icons/visibility-on.svg"
                                  : "/icons/visibility-off.svg"
                                  
                              }
                              alt="Toggle Password"
                              width={22}
                              height={22}
                              className="filter invert-0 brightness-0"
                            />
                          </span>
                          
                        </div>
                        <p className="text-gray-600 text-xs">
                          Password must be 8-16 characters, include at least:
                          <br />✔ One uppercase letter
                          <br />✔ One lowercase letter
                          <br />✔ One number
                          <br />✔ One special character (@, #, $, etc.)
                        </p>
                        {/* Confirm Password Field */}
                        <div className="relative mt-4">
                          <Label className="block">Confirm New Password</Label>
                          {/* Password Icon (Left) */}
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Image
                              src="/icons/password.svg"
                              alt="Password Icon"
                              width={22}
                              height={22}
                              className="filter invert-0 brightness-0"
                            />
                          </span>
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            className="border p-3 pl-12 pr-12 rounded mt-2 w-full"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          
                          <span
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            <Image
                              src={
                                showConfirmPassword
                                  ? "/icons/visibility-on.svg"
                                  : "/icons/visibility-off.svg"
                              }
                              alt="Toggle Password"
                              width={22}
                              height={22}
                              className="filter invert-0 brightness-0"
                            />
                          </span>
                        </div>
            {passwordError && (
              <p className="text-red-500 mt-2">{passwordError}</p>
            )}

            <Button className="mt-4 px-4 py-2 text-white rounded" onClick={handlePasswordReset}>Reset Password</Button>
          </div>
        )}
      </Accordion>

      {/* Show success message after password reset */}
       <Dialog open={resetSuccess} onOpenChange={setResetSuccess}>
              <DialogContent>
                <DialogHeader>
                  <h2 className="text-xl text-center font-bold">Password Reset Successfully</h2>
                </DialogHeader>
                <div className="flex justify-center">
                  <Image src="/passwordReset.png" alt="Success" width={150} height={150} />
                </div>
                <DialogFooter className="flex justify-center mt-4">
                  <Button className="mt-4 px-4 py-2 text-white rounded" onClick={() => setResetSuccess(false)}>OK</Button>
                </DialogFooter>
              </DialogContent>
        </Dialog>

      {showModal && (
        <AddAddressModal
          onClose={() => {
            setShowModal(false);
            setEditingAddress(null);
          }}
          onSave={editingAddress ? handleSaveEditedAddress : handleAddAddress}
          initialAddress={editingAddress}
        />
      )}
    </div>
    </div>
    </div>
  );
}

