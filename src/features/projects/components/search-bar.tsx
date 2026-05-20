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
  const helperTextId = "project-search-helper-text";

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
            placeholder="ค้นหาโปรเจกต์ ตำแหน่ง ทักษะ หรือคำที่เกี่ยวข้อง..."
            aria-describedby={helperTextId}
            className="h-12 min-h-11 w-full rounded-xl bg-white pl-11"
          />
          <p
            id={helperTextId}
            className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 sm:text-sm"
          >
            <span className="font-medium text-slate-600">ค้นหาได้จาก:</span>
            <span>ชื่อโปรเจกต์</span>
            <span aria-hidden="true">•</span>
            <span>ตำแหน่งที่เปิดรับ</span>
            <span aria-hidden="true">•</span>
            <span>ทักษะ</span>
            <span aria-hidden="true">•</span>
            <span>หมวดหมู่</span>
          </p>
        </div>

        <Button
          onClick={handleSearch}
          className="h-12 min-h-11 w-full shrink-0 rounded-xl bg-linear-to-br from-brand-500 via-brand-400 to-brand-300 px-6 text-white shadow-[0_4px_24px_rgb(253_94_75/0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgb(253_94_75/0.24)] active:scale-[0.98] hover:bg-linear-to-br hover:from-brand-500 hover:to-brand-400 sm:w-auto sm:min-w-30"
        >
          <Search className="h-4 w-4 sm:mr-1" />
          <span>ค้นหา</span>
        </Button>
      </div>
    </div>
  );
}
