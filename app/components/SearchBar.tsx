"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import styles from "./Navbar.module.css";

type SearchBarProps = {
  onSearch: (keyword: string) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [keyword, setKeyword] = useState("");

  function handleSearch() {
    onSearch(keyword.trim());
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl flex flex-col gap-3 md:flex-row md:items-center">
        {/* Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="ค้นหาโปรเจกต์ ตำแหน่ง หรือทักษะที่ต้องการ..."
            className="h-12 pl-11 rounded-xl bg-white"
          />
        </div>

        {/* Button */}
        <Button
          onClick={handleSearch}
          className={`${styles.postButton} h-12 w-full md:w-24 flex items-center gap-2`}
        >
          <Search className="h-4 w-4" />
          ค้นหา
        </Button>
      </div>
    </div>
  );
}
