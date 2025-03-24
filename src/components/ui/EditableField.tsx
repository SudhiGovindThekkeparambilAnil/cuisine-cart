import React, { useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import {Button} from "./button"
import { Label } from "./label";
import { Input } from "./input";

interface EditableFieldProps {
  label: string;
  value: string;
  isEditable: boolean;
  onSave: (newValue: string) => void;
}

const EditableField: React.FC<EditableFieldProps> = ({ label, value, isEditable, onSave }) => {
  const [editValue, setEditValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col pb-2 w-full">
      <Label className="block mt-4">{label}:</Label>
      {isEditing ? (
        <div className="flex items-center w-full">
          <Input
          type="text"
          value={editValue}
          placeholder={label}
          onChange={(e) => setEditValue(e.target.value)}
          className="border border-[#FFC487] px-2 py-1 text-[#333333] w-full "
          />
          <Button className="ml-2" onClick={handleSave}>Save</Button>
        </div>
      ) : (
        <div className="flex justify-between items-center w-full border border-[#FFC487] rounded p-2 mt-2 ">
          
          <div className="text-[#333333] flex-grow text-center">{value || <span className="text-gray-400">{label}</span>}</div>
          {isEditable && (
            <FaPencilAlt
            className="text-[#333333] cursor-pointer"
            onClick={() => setIsEditing(true)}
          />
          )}
        </div>
      )}
    </div>
  );
};

export default EditableField;
