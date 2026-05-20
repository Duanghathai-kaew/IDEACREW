"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type FilterOption = {
  value: string;
  label: string;
};

type TagFiltersProps = {
  typeFilter: string;
  statusFilter: string;
  typeOptions: FilterOption[];
  statusOptions: FilterOption[];
};

function buildUrl(searchParams: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(searchParams.toString());
  next.set(key, value);
  return `?${next.toString()}`;
}

function FilterMenu({
  label,
  value,
  options,
  queryKey,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  queryKey: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-between rounded-xl border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 shadow-none hover:bg-slate-50"
        >
          <span className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              {label}
            </span>
            <span>
              {options.find((option) => option.value === value)?.label ?? value}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-1">
        <div className="space-y-1">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  router.push(buildUrl(searchParams, queryKey, option.value))
                }
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                  selected
                    ? "bg-rose-50 text-rose-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{option.label}</span>
                {selected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TagFilters({
  typeFilter,
  statusFilter,
  typeOptions,
  statusOptions,
}: TagFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FilterMenu
        label="Type"
        value={typeFilter}
        options={typeOptions}
        queryKey="type"
      />
      <FilterMenu
        label="Status"
        value={statusFilter}
        options={statusOptions}
        queryKey="status"
      />
    </div>
  );
}
