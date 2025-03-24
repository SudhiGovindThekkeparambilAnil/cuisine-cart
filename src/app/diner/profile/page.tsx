// "use client";

// import React, { useState, useEffect } from "react";
// import Accordion from "@/components/ui/Accordion";
// import EditableField from "@/components/ui/EditableField";
// import AddAddressModal from "@/components/ui/AddAddressModal";

// // Define frontend interfaces
// interface IAddress {
//   type: string;
//   buildingNumber: string;  // Added field
//   street: string;
//   city: string;
//   state: string;
//   postalCode: string;
//   country: string;
//   phoneNumber: string; 
//   _id?: string;
// }

// interface IUser {
//   name: string;
//   email: string;
//   role: string;
//   addresses: IAddress[];
// }

// const DinerProfile = () => {
//   // Explicitly define the type for user state
//   const [user, setUser] = useState<IUser>({
//     name: "",
//     email: "",
//     role: "",
//     addresses: [],
//   });

//   const [showModal, setShowModal] = useState(false);
//   const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);

//   useEffect(() => {
//     // Fetch user data from the backend (use your API route)
//     const fetchUserProfile = async () => {
//       const response = await fetch("/api/profile");
//       if (response.ok) {
//         const data: IUser = await response.json(); // Explicitly type response
//         console.log("User Data:", data); // Log the user data
//         setUser(data);
        
//       } else {
//         console.log("Error fetching user profile:", response.statusText);
//       }
//     };
  
//     fetchUserProfile();
//   }, []);

  

//   const handleEditName = async (newName: string) => {
//     // Call API to update the name
//     await fetch("/api/profile/update", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ name: newName }),
//     });
//     setUser((prev) => ({ ...prev, name: newName }));
//   };

//   const handleAddAddress = async (address: IAddress) => {
//     const response = await fetch("/api/profile/add-address", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(address),
//     });
  
//     if (response.ok) {
//       const updatedUser: IUser = await response.json();
//       setUser(updatedUser); // Update user state with new data from backend
//     } else {
//       console.log("Error adding address:", await response.json());
//     }
//   };

//   const handleEditAddress = (address: IAddress) => {
//     setEditingAddress(address);
//     setShowModal(true);
//   };

//   const handleSaveEditedAddress = async (updatedAddress: IAddress) => {
//     const response = await fetch("/api/profile/update-address", {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(updatedAddress),
//     });

//     if (response.ok) {
//       setUser((prevUser) => ({
//         ...prevUser,
//         addresses: prevUser.addresses.map((addr) =>
//           addr._id === updatedAddress._id ? updatedAddress : addr
//         ),
//       }));
//     } else {
//       console.log("Error updating address:", await response.json());
//     }

//     setShowModal(false);
//     setEditingAddress(null);
//   };

  

//   return (
//     <div className="space-y-4">
//       <Accordion title="Personal Details">
//         <EditableField label="Name" value={user.name} isEditable onSave={handleEditName} />
//         <EditableField label="Email" value={user.email} isEditable={false} onSave={() => {}} />
//         <EditableField label="Role" value={user.role} isEditable={false} onSave={() => {}} />

//         <div className="mt-4">
//           <h3 className="font-semibold">Addresses</h3>
//           {user.addresses.length > 0 ? (
//             user.addresses.map((address, index) => (
//               <div key={index} className="border p-2 mt-2 rounded flex justify-between items-center">
//                 <div>
//                   <p><strong>Type:</strong> {address.type}</p>
//                   <p><strong>Building Number:</strong> {address.buildingNumber}</p>
//                   <p><strong>Street:</strong> {address.street}</p>
//                   <p><strong>City:</strong> {address.city}</p>
//                   <p><strong>State:</strong> {address.state}</p>
//                   <p><strong>Postal Code:</strong> {address.postalCode}</p>
//                   <p><strong>Country:</strong> {address.country}</p>
//                   <p><strong>Phone Number:</strong> {address.phoneNumber}</p>
//                 </div>
//                 <button
//                   onClick={() => handleEditAddress(address)}
//                   className="text-blue-500"
//                 >
//                   Edit
//                 </button>
//               </div>
//             ))
//           ) : (
//             <p>No addresses added yet.</p>
//           )}
//           <button onClick={() => setShowModal(true)} className="text-blue-500">
//             Add Address
//           </button>
//         </div>
//       </Accordion>

//       {showModal && (
//         <AddAddressModal
//           onClose={() => {
//             setShowModal(false);
//             setEditingAddress(null);
//           }}
//           onSave={editingAddress ? handleSaveEditedAddress : handleAddAddress}
//           initialAddress={editingAddress}
//         />
//       )}
//     </div>
//   );
// };

// export default DinerProfile;




"use client";

import React, { useState, useEffect } from "react";
import Accordion from "@/components/ui/Accordion";
import EditableField from "@/components/ui/EditableField";
import AddAddressModal from "@/components/ui/AddAddressModal";
import { Rating } from "@/components/ui/rating";
import Image from "next/image";
import { FaPencilAlt } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
}

const DinerProfile = () => {
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
    };

    fetchUserProfile();
  }, []);
  

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
            <p className="text-[#333333] mt-1">Cuisine Type</p>
          </div>
          <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
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
      {/* {resetSuccess && (
        <div className="mt-4 p-4 border border-green-500 rounded bg-green-50">
          <h2 className="text-xl font-bold">Password Reset Successfully</h2>
          <Image src="/passwordReset.png" alt="Success" width={200} height={200} />
          <Button className="mt-4 px-4 py-2 text-white rounded" onClick={() => setResetSuccess(false)}>OK</Button>
        </div>
      )} */}

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
};

export default DinerProfile;
