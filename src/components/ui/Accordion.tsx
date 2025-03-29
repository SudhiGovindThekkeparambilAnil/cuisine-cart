import React, { useState } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";

type AccordionProps = {
  title: string;
  children: React.ReactNode;
};

const Accordion = ({ title, children }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="border-b">
      <button
        className="w-full text-left py-3 px-4 text-xl font-semibold flex items-center justify-between"
        onClick={toggleAccordion}
      >
        <span>{title}</span>
        {/* Toggle between down and up arrows */}
        {isOpen ? (
          <HiOutlineChevronUp className="transition-transform duration-200" />
        ) : (
          <HiOutlineChevronDown className="transition-transform duration-200" />
        )}
      </button>
      {isOpen && <div className="py-4 px-4">{children}</div>}
    </div>
  );
};

export default Accordion;
