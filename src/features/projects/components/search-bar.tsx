"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

type SearchBarProps = {
  onSearch: (keyword: string) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [keyword, setKeyword] = useState("");

  function handleSearch() {
    onSearch(keyword.trim());
  }

  function handleKeywordChange(value: string) {
    setKeyword(value);
    onSearch(value.trim());
  }

  return (
    <div className="w-full min-w-0">
      <div className="mx-auto flex w-full max-w-4xl min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="ค้นหาโปรเจกต์ ตำแหน่ง หรือทักษะที่ต้องการ..."
            className="h-12 min-h-11 w-full rounded-xl bg-white pl-11"
          />
        </div>

        <Button
          onClick={handleSearch}
          className="h-12 min-h-11 w-full shrink-0 rounded-xl bg-linear-to-br from-(--brand-500) via-(--brand-400) to-(--brand-300) px-6 text-white shadow-[0_4px_24px_rgb(253_94_75/0.2)] hover:bg-linear-to-br hover:from-(--brand-500) hover:to-(--brand-400) sm:w-auto sm:min-w-[7.5rem]"
        >
          <Search className="h-4 w-4 sm:mr-1" />
          <span>ค้นหา</span>
        </Button>
      </div>
    </div>
  );
}
