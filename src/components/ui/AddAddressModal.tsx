
import React, { useState, useEffect } from "react";
import AddressForm from "./AddressForm";

interface AddAddressModalProps {
  onClose: () => void;
  onSave: (addressData: any) => void;
  initialAddress?: any;
}

const AddAddressModal: React.FC<AddAddressModalProps> = ({ onClose, onSave, initialAddress }) => {
  const [addressType, setAddressType] = useState("");

  // If there's an initial address, populate the form with that data
  useEffect(() => {
    if (initialAddress) {
      setAddressType(initialAddress.type || "");  // Set the type for the address if editing
    }
  }, [initialAddress]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg">
        <div className="mb-4">
          <label className="text-lg font-semibold">Select Address Type:</label>
          <select
            className="border border-gray-300 rounded px-2 py-1 w-full"
            value={addressType}
            onChange={(e) => setAddressType(e.target.value)}
          >
            <option value="">Select</option>
            <option value="home">Home</option>
            <option value="office">Office</option>
            <option value="other">Other</option>
          </select>
        </div>
        {addressType && <AddressForm onSave={onSave} addressType={addressType} initialAddress={initialAddress} />}
        <div className="flex justify-end space-x-2">
          <button className="text-red-500" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddAddressModal;
