"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function UserFilter() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to page 1
    replace(`?${params.toString()}`);
  };

  const chevronIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );

  const selectClass =
    "appearance-none bg-[#09090b] border border-zinc-800 rounded-lg pl-4 pr-10 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-medium min-w-[140px] cursor-pointer";

  return (
    <div className="flex gap-3 flex-wrap">
      {/* Role Filter */}
      <div className="relative">
        <select
          onChange={(e) => handleFilterChange("role", e.target.value)}
          defaultValue={searchParams.get("role")?.toString() || "all"}
          className={selectClass}
        >
          <option value="all" className="bg-[#09090b]">All Roles</option>
          <option value="super_admin" className="bg-[#09090b]">Super Admin</option>
          <option value="admin" className="bg-[#09090b]">Admin</option>
          <option value="premium" className="bg-[#09090b]">Premium</option>
          <option value="writer" className="bg-[#09090b]">Writer</option>
          <option value="user" className="bg-[#09090b]">User</option>
        </select>
        {chevronIcon}
      </div>

      {/* Sort Field */}
      <div className="relative">
        <select
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          defaultValue={searchParams.get("sortBy")?.toString() || "date"}
          className={selectClass}
        >
          <option value="date" className="bg-[#09090b]">Date Joined</option>
          <option value="name" className="bg-[#09090b]">Name</option>
        </select>
        {chevronIcon}
      </div>

      {/* Sort Order */}
      <div className="relative">
        <select
          onChange={(e) => handleFilterChange("order", e.target.value)}
          defaultValue={searchParams.get("order")?.toString() || "asc"}
          className={selectClass}
        >
          <option value="asc" className="bg-[#09090b]">Ascending</option>
          <option value="desc" className="bg-[#09090b]">Descending</option>
        </select>
        {chevronIcon}
      </div>
    </div>
  );
}
