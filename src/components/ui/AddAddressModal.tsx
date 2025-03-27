
import React, { useState, useEffect } from "react";
import AddressForm from "./AddressForm";

interface IAddress {
  _id?: string;
  type: string;
  buildingNumber: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
}

interface AddAddressModalProps {
  onClose: () => void;
  onSave: (addressData: any) => void;
  initialAddress?: any;
  existingAddresses: IAddress[]; 
}

const AddAddressModal: React.FC<AddAddressModalProps> = ({ onClose, onSave, initialAddress, existingAddresses, }) => {
  const [addressType, setAddressType] = useState("");
  const [error, setError] = useState("");

   // Pre-fill address type when editing
   useEffect(() => {
    if (initialAddress) {
      setAddressType(initialAddress.type || "");
    }
  }, [initialAddress]);

   const handleAddressTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    const alreadyExists = existingAddresses.some(addr => addr.type === selectedType);

    if (alreadyExists) {
      setError(`You already have a ${selectedType} address.`);
    } else {
      setError("");
      setAddressType(selectedType);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg">
      {!addressType && (
        <div className="mb-4">
          <label className="text-lg font-semibold">Select Address Type:</label>
          <select
            className="border border-gray-300 rounded px-2 py-1 w-full"
            value={addressType}
            onChange={handleAddressTypeChange}
            disabled={!!initialAddress}
          >
            <option value="">Select</option>
            <option value="home">Home</option>
            <option value="office">Office</option>
            <option value="other">Other</option>
          </select>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        )}
        {addressType && !error && ( <AddressForm onSave={onSave} addressType={addressType} initialAddress={initialAddress} />)}
        <div className="flex justify-end space-x-2">
          <button className="text-red-500" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddAddressModal;
