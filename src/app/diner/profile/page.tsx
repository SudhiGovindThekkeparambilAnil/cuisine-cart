
"use client";

import React, { useState, useEffect } from "react";
import Accordion from "@/components/ui/Accordion";
import EditableField from "@/components/ui/EditableField";
import AddAddressModal from "@/components/ui/AddAddressModal";
import Image from "next/image";
import axios from "axios";
import { FaPencilAlt } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import UploadImage from "@/components/core/UploadImage/UploadImage";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

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
  profileImage?: string;
}

export default function DinerProfilePage() {
  const [user, setUser] = useState<IUser>({
    name: "",
    email: "",
    role: "",
    addresses: [],
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
  const [nameError, setNameError] = useState<string | null>(null);
  const router = useRouter();

   useEffect(() => {
      setIsMounted(true); // Prevents hydration error
    }, []);
  

    useEffect(() => {
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get("/api/profile");
          if (response.status === 200) {
            setUser(response.data);
          } else {
            console.log("Error fetching user profile:", response.statusText);
          }
        } catch (error) {
          console.log("Error fetching user profile:", error);
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
  
  const handleEditName = async (newName: string) => {
    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    if (!nameRegex.test(newName)) {
      setNameError("Name must be 2-50 characters long and contain only letters.");
      return;
    }

    setNameError(""); 

    try {
      const response = await axios.post("/api/profile/update", { name: newName });
      if (response.status === 200) {
        setUser((prev) => ({ ...prev, name: newName }));
        router.refresh();
      } else {
        console.error("Failed to update name:", response.data);
      }
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const handleAddAddress = async (address: IAddress) => {
    const alreadyExists = user.addresses.some(addr => addr.type === address.type);
    if (alreadyExists) {
      alert(`You already have a ${address.type} address.`);
      return;
    }
  
    try {
      const response = await axios.post("/api/profile/add-address", address);
      if (response.status === 200) {
        setUser(response.data);
        setShowModal(false);
      } else {
        console.error("Error adding address:", response.data);
      }
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  const handleEditAddress = (address: IAddress) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleSaveEditedAddress = async (updatedAddress: IAddress) => {
    try {
      const response = await axios.put("/api/profile/update-address", updatedAddress);
      if (response.status === 200) {
        setUser((prevUser) => ({
          ...prevUser,
          addresses: prevUser.addresses.map((addr) =>
            addr._id === updatedAddress._id ? updatedAddress : addr
          ),
        }));
        setShowModal(false);
        setEditingAddress(null);
      } else {
        console.error("Error updating address:", response.data);
      }
    } catch (error) {
      console.error("Error updating address:", error);
    }
  };

  const validatePassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    return passwordRegex.test(password);
  };


  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (!validatePassword(newPassword)) {
      setPasswordError(
        "Password must be 8-16 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    setPasswordError(null);


    const token = localStorage.getItem("token");
    if (!token) {
      setPasswordError("Token is missing or expired");
      return;
    }
    
    try {
      const response = await axios.post("/api/auth/reset-password", { token, password: newPassword });
      if (response.status === 200) {
        setResetSuccess(true); // Show success box
        setShowPasswordReset(false); // Hide the reset form after successful change
      } else {
        console.error("Error resetting password:", response.data);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  
  if (loading) {
    return <Loader />; // Show the loader component while loading
  }

  return (
    <div className="min-h-screen bg-[#FFF6EC] flex justify-center items-center p-6">
        <div className="bg-white shadow-lg rounded-lg p-6 pb-24 w-full max-w-3xl">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-gray-300">
                  
                  {/* Profile Icon */}
                  <div className="flex flex-col items-center sm:w-1/2 sm:mr-4">
                    {isMounted && (
                      <div className="w-32 h-32 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
                        {user.profileImage ? (
                          <Image
                            src={user.profileImage}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="w-32 h-32 sm:w-32 sm:h-32 rounded-full object-cover"
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
                    <div className="mt-4">
                    <UploadImage onUploadComplete={handleImageUpload} />
                    </div>
                  </div>
                  <div className="sm:w-2/3 mt-10 sm:mt-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#000000] uppercase">{user.name}</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-2">Welcome to your profile, {user.name}! <br /> Here you can manage your details and personalize your experience.</p>
                  </div>
                </div>
        

    <div className="mt-4">
      <Accordion title="Personal Details">
      <div className="p-4 bg-white">
        <EditableField label="Name" value={user.name} isEditable onSave={handleEditName} />
        {nameError && <p className="text-red-500 mt-1">{nameError}</p>}
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
                  <p><strong>Province:</strong> {address.state}</p>
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
          <button onClick={() => setShowModal(true)} className="text-[#F39C12] mt-4">
            Add Address
          </button>
        </div>
        </div>
      </Accordion>

       {/* Account and Security Accordion */}
       <Accordion title="Account and Security">
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

            <div className="mt-4 flex gap-2">
                <Button className="px-4 py-2 text-white rounded" onClick={handlePasswordReset}>
                  Reset Password
                </Button>
                <Button
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                  onClick={() => setShowPasswordReset(false)}>
                  Cancel
                </Button>
            </div>
          </div>
        )}
      </Accordion>

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
          existingAddresses={user.addresses} 
        />
      )}
    </div>
    </div>
    </div>
  );
};

