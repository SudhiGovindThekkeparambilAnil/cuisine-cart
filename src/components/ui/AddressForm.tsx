import React, { useState, useEffect } from "react";
import { Button } from "./button";
import axios from "axios";

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
    _id: "", // Make sure _id is either empty or from initialAddress
    type: "",
    buildingNumber: "",
    street: "",
    city: "",
    state: "Ontario",
    country: "Canada",
    postalCode: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [cities, setCities] = useState<string[]>([]);

  // Fetch cities from JSON file using Axios
  useEffect(() => {
    axios
      .get("/cities.json") // Ensure the correct path
      .then((response) => setCities(response.data))
      .catch((error) => console.error("Error loading cities:", error));
  }, []);

  // Pre-fill the form with initial address data if it exists
  useEffect(() => {
    if (initialAddress) {
      setAddressFields({
        _id: initialAddress._id || "", // Include _id for editing, else leave it empty
        type: initialAddress.type || "",
        buildingNumber: initialAddress.buildingNumber || "",
        street: initialAddress.street || "",
        city: initialAddress.city || "",
        state: initialAddress.state || "Ontario",
        country: initialAddress.country || "Canada",
        postalCode: initialAddress.postalCode || "",
        phoneNumber: initialAddress.phoneNumber || "",
      });
    }
  }, [initialAddress]);

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    if (!addressFields.buildingNumber.trim())
      newErrors.buildingNumber = "Building Number is required.";
    if (!addressFields.street.trim()) newErrors.street = "Street is required.";
    if (!addressFields.city.trim()) newErrors.city = "City is required.";

    // Building number validation (1 to 10 characters, alphanumeric, spaces, hyphens)
    if (!/^[0-9\s\-]{1,15}$/.test(addressFields.buildingNumber.trim())) {
      newErrors.buildingNumber =
        "Building Number should contain only numbers, spaces, and hyphens, and be between 1 and 15 characters.";
    }

    // Street validation (3 to 50 characters, alphanumeric, spaces, hyphens, commas)
    if (!/^[A-Za-z0-9\s\-\,]{3,50}$/.test(addressFields.street.trim())) {
      newErrors.street =
        "Street should contain only letters, numbers, spaces, hyphens, and commas, and be between 3 and 50 characters.";
    }

    if (!/^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/.test(addressFields.postalCode))
      newErrors.postalCode = "Invalid Postal Code (Format: A1A 1A1).";

    if (!/^\d{10}$/.test(addressFields.phoneNumber))
      newErrors.phoneNumber = "Phone Number must be 10 digits.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    onSave(addressData); // Call the save function
  };

  return (
    <div className="max-h-[400px] overflow-y-auto p-4 border border-gray-200 rounded-lg shadow-md w-full sm:w-[350px]">
      {["buildingNumber", "street", "postalCode", "phoneNumber"].map((field) => (
        <div key={field} className="flex flex-col space-y-2 mb-7">
          <label className="font-semibold text-sm">{fieldLabels[field]}</label>{" "}
          {/* Display friendly label */}
          <input
            type="text"
            name={field}
            value={addressFields[field as keyof typeof addressFields]}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-3 w-full"
          />
          {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
        </div>
      ))}

      {/* City Dropdown */}
      <div className="flex flex-col space-y-2 mb-7">
        <label className="font-semibold text-sm">City</label>
        <select
          name="city"
          value={addressFields.city}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-3 w-full">
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
      </div>

      {/* Country (Readonly) */}
      <div className="flex flex-col space-y-2 mb-7">
        <label className="font-semibold text-sm">Country</label>
        <input
          type="text"
          name="country"
          value={addressFields.country}
          readOnly
          className="border border-gray-300 rounded px-3 py-3 w-full bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* State (Readonly) */}
      <div className="flex flex-col space-y-2 mb-7">
        <label className="font-semibold text-sm">Province</label>
        <input
          type="text"
          name="state"
          value={addressFields.state}
          readOnly
          className="border border-gray-300 rounded px-3 py-3 w-full bg-gray-100 cursor-not-allowed"
        />
      </div>

      <Button onClick={handleSave} className="w-full">
        Save
      </Button>
    </div>
  );
};

export default AddressForm;
