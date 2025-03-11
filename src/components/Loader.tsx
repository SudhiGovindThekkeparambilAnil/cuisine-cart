import React from "react";
import Image from "next/image";

const Loader: React.FC = () => {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50" // Removed background image, added white background
    >
      <Image
        src="/icons/loader.svg"
        alt="Loading..."
        width={200}
        height={300}
        className="w-50 h-50 animate-spin"
      />
    </div>
  );
};

export default Loader;