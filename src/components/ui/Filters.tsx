"use client";

import { useMemo } from "react";
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

export default function Filters({ data, filters, setFilters }: FiltersProps) {
  // Getting the dropdown options from the data
  const cuisineOptions = useMemo(
    () => [...new Set(data.map((item) => item.cuisine))],
    [data]
  );
  const typeOptions = useMemo(
    () => [...new Set(data.map((item) => item.type))],
    [data]
  );
  const chefOptions = useMemo(
    () => [...new Set(data.map((item) => item.chefName))],
    [data]
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 items-center">
      {/* Search Input */}
      <Input
        type="text"
        placeholder="Search by name"
        className="p-2 border rounded"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />

      {/* Cuisine Filter */}
      <Select onValueChange={(val) => setFilters({ ...filters, cuisine: val })} value={filters.cuisine}>
        <SelectTrigger>
          <SelectValue placeholder="All Cuisines" />
        </SelectTrigger>
        <SelectContent>
          {/* <SelectItem value="">All Cuisines</SelectItem> */}
          {cuisineOptions.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select onValueChange={(val) => setFilters({ ...filters, type: val })} value={filters.type}>
        <SelectTrigger>
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          {/* <SelectItem value="">All Types</SelectItem> */}
          {typeOptions.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Chef Name Filter */}
      <Select onValueChange={(val) => setFilters({ ...filters, chef: val })} value={filters.chef}>
        <SelectTrigger>
          <SelectValue placeholder="All Chefs" />
        </SelectTrigger>
        <SelectContent>
          {/* <SelectItem value="">All Chefs</SelectItem> */}
          {chefOptions.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sorting  */}
      <Select
        onValueChange={(val) => setFilters({ ...filters, sort: val }) }
        value={filters.sort}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          {/* <SelectItem value="">Sort By</SelectItem> */}
          <SelectItem value="priceAsc">Price: Low to High</SelectItem>
          <SelectItem value="priceDesc">Price: High to Low</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset Button */}
      <Button
        onClick={() =>
          setFilters({ search: "", cuisine: "", type: "", chef: "", sort: "" })
        }
      >
        Reset Filters
      </Button>
    </div>
  );
}
