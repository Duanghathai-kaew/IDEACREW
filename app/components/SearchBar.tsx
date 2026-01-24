"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import styles from "./Navbar.module.css";
export default function SearchBar() {
  return (
    <div className="w-full">
      <div
        className="
          mx-auto
          max-w-4xl
          flex flex-col gap-3
          md:flex-row md:items-center
        "
      >
        {/* Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ค้นหาโปรเจกต์ ตำแหน่ง หรือทักษะที่ต้องการ..."
            className="
              h-12
              pl-11
              text-base
              rounded-xl
              border-border
              bg-white
            "
          />
        </div>

        {/* Button */}
        <Button
          className={`${styles.postButton} mr-10 h-12 w-20 flex items-center gap-2`}
        >
          <Search className="h-4 w-4" />
          ค้นหา
        </Button>
      </div>
    </div>
  );
}
