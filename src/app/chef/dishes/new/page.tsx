"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Loader from "@/components/Loader";
import UploadImage from "@/components/core/UploadImage/UploadImage";
import Image from "next/image";

export default function CreateChefDishPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [modifiers, setModifiers] = useState<
    {
      title: string;
      required: boolean;
      limit: number;
      items: { title: string; price: string }[];
    }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  const handleModifierChange = (index: number, key: string, value: any) => {
    setModifiers((prev) =>
      prev.map((mod, i) => {
        if (i === index) {
          return {
            ...mod,
            [key]: value,
          };
        }
        return mod;
      })
    );
  };

  const handleItemChange = (
    modIndex: number,
    itemIndex: number,
    key: string,
    value: any
  ) => {
    setModifiers((prev) =>
      prev.map((mod, i) =>
        i === modIndex
          ? {
              ...mod,
              items: mod.items.map((item, j) =>
                j === itemIndex ? { ...item, [key]: value } : item
              ),
            }
          : mod
      )
    );
  };

  const addModifier = () => {
    setModifiers([
      ...modifiers,
      {
        title: "",
        required: false,
        limit: 1,
        items: [{ title: "", price: "" }],
      },
    ]);
  };

  const removeModifier = (index: number) => {
    setModifiers((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = (index: number) => {
    setModifiers((prev) =>
      prev.map((mod, i) =>
        i === index
          ? { ...mod, items: [...mod.items, { title: "", price: "" }] }
          : mod
      )
    );
  };

  const removeItem = (modIndex: number, itemIndex: number) => {
    setModifiers((prev) =>
      prev.map((mod, i) =>
        i === modIndex
          ? { ...mod, items: mod.items.filter((_, j) => j !== itemIndex) }
          : mod
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedType = type.trim();
    const trimmedCuisine = cuisine.trim();
    const trimmedDescription = description.trim();

    // **Validation Checks**
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      setError("Dish name must be between 3 and 50 characters.");
      return;
    }

    const allowedTypes = ["Breakfast", "Lunch", "Dinner"];
    if (!allowedTypes.includes(trimmedType)) {
      setError("Dish type must be one of: Breakfast, Lunch, or Dinner.");
      return;
    }

    if (trimmedCuisine.length < 3 || trimmedCuisine.length > 50) {
      setError("Cuisine must be between 3 and 50 characters.");
      return;
    }

    if (trimmedDescription.length < 10 || trimmedDescription.length > 500) {
      setError("Description must be between 10 and 500 characters.");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Price must be a positive number.");
      return;
    }

    for (const modifier of modifiers) {
      const modTitle = modifier.title.trim();
      if (modTitle.length < 3 || modTitle.length > 30) {
        setError("Each modifier title must be between 3 and 30 characters.");
        return;
      }

      if (modifier.limit <= 0) {
        setError("Modifier limit must be greater than 0.");
        return;
      }

      for (const item of modifier.items) {
        const itemTitle = item.title.trim();
        if (itemTitle.length < 3 || itemTitle.length > 30) {
          setError("Each item title must be between 3 and 30 characters.");
          return;
        }

        const itemPrice = parseFloat(item.price);
        if (
          isNaN(itemPrice) ||
          itemPrice <= 0 ||
          !/^\d+(\.\d{1,2})?$/.test(item.price)
        ) {
          setError(
            "Each item price must be a positive number with up to 2 decimal places."
          );
          return;
        }
      }
    }

    const dishData = {
      name,
      type,
      cuisine,
      photoUrl,
      description,
      price: parsedPrice,
      modifiers: modifiers.map((mod) => ({
        ...mod,
        required: Boolean(mod.required), // Ensure boolean
      })),
    };

    // Retrieve the token from sessionStorage
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      const res = await fetch("/api/dishes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dishData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create dish");
      }

      router.push("/chef/dishes");
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Card className="p-6">
        <h1 className="text-xl font-bold mb-4">Chef - Create New Dish</h1>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Side - Dish Details */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label>Dish Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex-1 space-y-4">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => {
                    const value = e.target.value;

                    // Allow empty value for user convenience
                    if (value === "") {
                      setPrice(value);
                      return;
                    }

                    // Regex: Allow up to 4 digits before decimal and up to 2 digits after
                    if (/^\d{0,4}(\.\d{0,2})?$/.test(value)) {
                      setPrice(value);
                    }
                  }}
                  className="w-full"
                />
              </div>

              <div className="flex-1 space-y-4">
                <Label>Description</Label>
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>

              <div className="flex-1 space-y-4">
                <Label>Type</Label>
                <select
                  className="border p-2 w-full rounded"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div className="flex-1 space-y-4">
                <Label>Cuisine</Label>
                <Input
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full"
                />
              </div>

              <fieldset className="space-y-2 border-none p-0 m-0">
                <Label>Dish Image</Label>
                {photoUrl && (
                  <div className="mb-4">
                    <Image
                      src={photoUrl}
                      alt="Uploaded Dish"
                      className="w-1/2 h-auto rounded-md"
                      width={100}
                      height={100}
                    />
                  </div>
                )}
                <div
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission when clicking on the upload area
                  }}
                >
                  <UploadImage onUploadComplete={(url) => setPhotoUrl(url)} />
                </div>
              </fieldset>
            </div>

            {/* Vertical Separator */}
            <div className="hidden md:block w-px bg-gray-300"></div>

            {/* Right Side - Modifiers */}
            <div className="flex-1 space-y-4">
              <h2 className="text-lg font-bold">Modifiers</h2>
              {modifiers.map((modifier, modIndex) => (
                <div key={modIndex} className="border p-4 rounded mb-4">
                  <Label>Modifier Title</Label>
                  <Input
                    value={modifier.title}
                    onChange={(e) =>
                      handleModifierChange(modIndex, "title", e.target.value)
                    }
                    className="w-full"
                  />

                  <Label>Required / Optional</Label>
                  <select
                    className="border p-2 w-full mb-2"
                    value={modifier.required ? "true" : "false"}
                    onChange={(e) =>
                      handleModifierChange(
                        modIndex,
                        "required",
                        e.target.value === "true"
                      )
                    }
                  >
                    <option value="true">Required</option>
                    <option value="false">Optional</option>
                  </select>

                  <Label>Limit to Choose</Label>
                  <Input
                    type="number"
                    value={modifier.limit}
                    onChange={(e) =>
                      handleModifierChange(
                        modIndex,
                        "limit",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-full"
                  />

                  {/* Items within Modifier */}
                  {modifier.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="bg-gray-100 p-3 rounded-md mb-2"
                    >
                      <Label>Item Title</Label>
                      <Input
                        placeholder="Item Title"
                        value={item.title}
                        onChange={(e) =>
                          handleItemChange(
                            modIndex,
                            itemIndex,
                            "title",
                            e.target.value
                          )
                        }
                        className="w-full"
                      />

                      <Label>Price</Label>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => {
                          const value = e.target.value;

                          // Allow empty value for user convenience
                          if (value === "") {
                            handleItemChange(
                              modIndex,
                              itemIndex,
                              "price",
                              value
                            );
                            return;
                          }

                          // Regex: Allow up to 4 digits before decimal and up to 2 digits after
                          if (/^\d{0,4}(\.\d{0,2})?$/.test(value)) {
                            handleItemChange(
                              modIndex,
                              itemIndex,
                              "price",
                              value
                            );
                          }
                        }}
                        className="w-full"
                      />

                      <div className="text-right">
                        <span
                          className="text-blue-500 underline cursor-pointer"
                          onClick={() => removeItem(modIndex, itemIndex)}
                        >
                          Remove Item
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="text-right">
                    <span
                      className="text-blue-500 underline cursor-pointer"
                      onClick={() => addItem(modIndex)}
                    >
                      + Add Item
                    </span>
                  </div>

                  <div className="text-center">
                    <span
                      className="text-red-500 underline cursor-pointer"
                      onClick={() => removeModifier(modIndex)}
                    >
                      Remove Modifier
                    </span>
                  </div>
                </div>
              ))}

              <span
                className="text-blue-500 underline cursor-pointer block text-center"
                onClick={addModifier}
              >
                + Add Modifier
              </span>
            </div>
          </div>

          {/* Submit button at the bottom */}
          <div className="w-full md:w-1/3 mx-auto">
            <Button type="submit" className="w-full">
              Save Dish
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
