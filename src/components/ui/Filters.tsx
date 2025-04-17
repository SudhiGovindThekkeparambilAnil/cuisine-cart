"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FiltersProps {
  data: any[];
  filters: {
    search: string;
    cuisine: string;
    type: string;
    chef: string;
    sort: string;
  };
  setFilters: (filters: any) => void;
}
const capitalizeFirstLetter = (val: string) => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
};

export default function Filters({ data, filters, setFilters }: FiltersProps) {
  const cuisineOptions = useMemo(
    () => [...new Set(data.map((item) => capitalizeFirstLetter(item.cuisine)))],
    [data]
  );
  const typeOptions = useMemo(
    () => [...new Set(data.map((item) => capitalizeFirstLetter(item.type)))],
    [data]
  );
  const chefOptions = useMemo(
    () => [
      ...new Set(data.map((item) => capitalizeFirstLetter(item.chefName))),
    ],
    [data]
  );

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4 justify-between mb-6">
      {/* Left side: Search and Filters */}
      <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
        {/* Search Input */}
        <Input
          type="text"
          placeholder="Search by name"
          className="w-48"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        {/* Cuisine Filter */}
        <Select
          onValueChange={(val) =>
            setFilters({ ...filters, cuisine: val === "All" ? "" : val })
          }
          value={filters.cuisine || "All"}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Cuisines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Cuisines</SelectItem>
            {cuisineOptions.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Type Filter */}
        <Select
          onValueChange={(val) =>
            setFilters({ ...filters, type: val === "All" ? "" : val })
          }
          value={filters.type || "All"}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            {typeOptions.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Chef Name Filter */}
        {role == "diner" ? (
          <Select
            onValueChange={(val) =>
              setFilters({ ...filters, chef: val === "All" ? "" : val })
            }
            value={filters.chef || "All"}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Chefs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Chefs</SelectItem>
              {chefOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <></>
        )}
      </div>

      {/* Right side: Sort and Reset */}
      <div className="flex items-center gap-4 ml-auto">
        <Select
          onValueChange={(val) =>
            setFilters({ ...filters, sort: val === "All" ? "" : val })
          }
          value={filters.sort}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Featured</SelectItem>
            <SelectItem value="priceAsc">Price: Low to High</SelectItem>
            <SelectItem value="priceDesc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="destructive"
          onClick={() =>
            setFilters({
              search: "",
              cuisine: "",
              type: "",
              chef: "",
              sort: "",
            })
          }
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
