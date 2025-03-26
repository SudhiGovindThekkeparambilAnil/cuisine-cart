
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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

  const validateFields = () => {
    let newErrors: { [key: string]: string } = {};

    if (!addressFields.buildingNumber.trim()) newErrors.buildingNumber = "Building Number is required.";
    if (!addressFields.street.trim()) newErrors.street = "Street is required.";
    if (!addressFields.city.trim()) newErrors.city = "City is required.";
    if (!addressFields.state.trim()) newErrors.state = "State is required.";
    if (!addressFields.country.trim()) newErrors.country = "Country is required.";

    if (!/^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/.test(addressFields.postalCode))
      newErrors.postalCode = "Invalid Postal Code (Format: A1A 1A1).";

    if (!/^\d{10}$/.test(addressFields.phoneNumber))
      newErrors.phoneNumber = "Phone Number must be 10 digits.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressFields((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); 
  };

  const handleSave = () => {
    if (!validateFields()) return; 
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
          {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
        </div>
      ))}
      <Button onClick={handleSave} className="py-3 px-4 rounded w-full">Save</Button>
    </div>
  );
};

export default AddressForm;
