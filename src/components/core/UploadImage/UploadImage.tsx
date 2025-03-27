"use client";

import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { uploadImage } from "./actions";
import NextImage from "next/image";
import { toast } from "sonner";

// Function to crop image using canvas
const getCroppedImage = async (imageSrc: string, croppedAreaPixels: any): Promise<File | null> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise<File | null>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("❌ Cropping failed: No blob generated.");
        resolve(null);
        return;
      }
      const file = new File([blob], "cropped-image.jpg", {
        type: "image/jpeg",
      });
      resolve(file);
    }, "image/jpeg");
  });
};

export default function UploadFile({
  onUploadComplete,
  aspectRatio = 1, // Default aspect ratio to 1 (Square)
}: {
  onUploadComplete: (url: string) => void;
  aspectRatio?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cropComplete, setCropComplete] = useState(false);
  const [cropMessage, setCropMessage] = useState("Please select the crop area before proceeding.");

  // Crop settings
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modify all button click handlers
  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  // Handle file selection and show preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault(); // Prevent form submission
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCroppedImage(null);
      setCropComplete(false);
      setCropMessage("Please select the crop area before proceeding.");
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  // Handle cropping
  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Crop and prepare the image for upload
  const handleCropClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!imagePreview || !selectedFile || !croppedAreaPixels) {
      alert("Please select an image and crop area.");
      return;
    }

    const croppedFile = await getCroppedImage(imagePreview, croppedAreaPixels);

    if (!croppedFile) {
      alert("Cropping failed. Please try again.");
      return;
    }

    setCroppedImage(URL.createObjectURL(croppedFile)); // ✅ Only if it's valid
    setSelectedFile(croppedFile);
    setCropComplete(true);
    setCropMessage("Cropped image ready for upload.");
  };

  // Upload function
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedFile) {
      toast.error("Please select an image to upload.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const url = await uploadImage(formData);
      onUploadComplete(url); // Pass the URL back to parent component
      closeModal();
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Upload failed", {
        description: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Close modal
  const closeModal = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setImagePreview("");
    setCroppedImage(null);
    setCropComplete(false);
    setCropMessage("Please select the crop area before proceeding.");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div>
      {/* Button to Open Modal */}
      <button
        type="button"
        onClick={handleOpenModal}
        className="bg-gradient-to-r from-[#E47D02] via-[#FF9A1F] to-[#F4A343] hover:opacity-90 text-white px-3 py-1.5 text-sm rounded-lg shadow-md hover:shadow-lg transition-all"
      >
        Upload Image
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}>
          <div
            className="bg-white p-6 rounded-xl shadow-lg w-[600px]"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Image</h2>

            {/* File Input */}
            {!selectedFile ? (
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="mb-4 border border-gray-300 p-3 rounded-lg w-full text-gray-600"
              />
            ) : croppedImage ? (
              // Show Cropped Image Preview
              <div className="flex flex-col items-center">
                <NextImage
                  src={croppedImage}
                  alt="Cropped Preview"
                  className="rounded-lg shadow-md mb-4 w-60 h-60 object-cover border border-gray-300"
                />
                <p className="text-gray-600 text-sm">{cropMessage}</p>
              </div>
            ) : (
              <>
                {/* Display Message to Select Crop Area */}
                <p className="text-blue-500 text-sm font-semibold mb-2">{cropMessage}</p>

                {/* Cropping UI */}
                <div className="relative w-full h-64 bg-gray-100 rounded-lg shadow-md overflow-hidden">
                  <Cropper
                    image={imagePreview}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio} // Dynamic aspect ratio
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>

                {/* Confirm Buttons */}
                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="bg-red-500 text-white px-5 py-2 mr-3 rounded-lg shadow hover:bg-red-600"
                  >
                    Upload Another Image
                  </button>
                  <button
                    type="button"
                    onClick={handleCropClick}
                    className={`bg-green-500 text-white px-5 py-2 rounded-lg shadow hover:bg-green-600 transition ${
                      cropComplete ? "opacity-50" : ""
                    }`}
                    disabled={cropComplete}>
                    {cropComplete ? "Cropped" : "Crop Image"}
                  </button>
                </div>
              </>
            )}

            {/* Upload Button */}
            {croppedImage && (
              <button
                type="button"
                onClick={handleUpload}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg w-full mt-4 shadow-md hover:bg-indigo-700 transition"
                disabled={loading}>
                {loading ? "Uploading..." : "Upload"}
              </button>
            )}

            {/* Close Button */}
            <button onClick={closeModal} className="text-gray-500 mt-3 block mx-auto text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
