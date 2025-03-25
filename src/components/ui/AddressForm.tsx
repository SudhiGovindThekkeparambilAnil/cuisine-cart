
import React, { useState, useEffect } from "react";
import {Button} from "./button"

interface AddressFormProps {
  addressType: string;
  onSave: (addressData: any) => void;
  initialAddress?: any; // Optional initialAddress prop
}

const fieldLabels: Record<string, string> = {
  buildingNumber: "Building Number",
  street: "Street",
  city: "City",
  state: "State",
  country: "Country",
  postalCode: "Postal Code",
  phoneNumber: "Phone Number",
};

const AddressForm: React.FC<AddressFormProps> = ({ addressType, onSave, initialAddress }) => {
  const [addressFields, setAddressFields] = useState<{
    _id?: string;
    type: string;
    buildingNumber: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phoneNumber: string;
  }>({
    _id: "",  // Make sure _id is either empty or from initialAddress
    type: "",
    buildingNumber: "",
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phoneNumber: "",
  });

  // Pre-fill the form with initial address data if it exists
  useEffect(() => {
    if (initialAddress) {
      setAddressFields({
        _id: initialAddress._id || "",  // Include _id for editing, else leave it empty
        type: initialAddress.type || "",
        buildingNumber: initialAddress.buildingNumber || "",
        street: initialAddress.street || "",
        city: initialAddress.city || "",
        state: initialAddress.state || "",
        country: initialAddress.country || "",
        postalCode: initialAddress.postalCode || "",
        phoneNumber: initialAddress.phoneNumber || "",
      });
    }
  }, [initialAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const addressData = { ...addressFields, type: addressType };

    // If it's an existing address, ensure _id is passed with the data
    if (initialAddress && initialAddress._id) {
      addressData._id = initialAddress._id;
    }

    onSave(addressData);  // Call the save function
  };

  return (
    <div className="max-h-[400px] overflow-y-auto p-4 border border-gray-200 rounded-lg shadow-md w-[350px]">
      {["buildingNumber", "street", "city", "state", "country", "postalCode", "phoneNumber"].map((field) => (
        <div key={field} className="flex flex-col mb-2">
          <label className="font-semibold text-sm">{fieldLabels[field]}</label> {/* Display friendly label */}
          <input
            type="text"
            name={field}
            value={addressFields[field as keyof typeof addressFields]}
            onChange={handleChange}
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
        </div>
      ))}
      <Button onClick={handleSave} className="py-3 px-4 rounded w-full">Save</Button>
    </div>
  );
};

export default AddressForm;
