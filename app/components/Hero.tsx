"use client";
import { useEffect, useState } from "react";

export default function Hero() {
  const [showH1, setShowH1] = useState(false);
  const [showH2, setShowH2] = useState(false);
  const [showP, setShowP] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowH1(true), 100);
    const t2 = setTimeout(() => setShowH2(true), 500);
    const t3 = setTimeout(() => setShowP(true), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <section
      className="w-full flex flex-col items-center justify-center py-16 px-4 md:py-24 md:px-0 relative overflow-hidden group"
      style={{ minHeight: 320 }}
    >
      {/* วงกลมกราเดี้ยนจางๆ เล็ก 2 อัน ลอยซ้ายบนและขวาล่าง */}
      <div
        className="absolute z-0 left-1/2 top-1/2 w-[180px] h-[180px] rounded-full opacity-20 blur-2xl pointer-events-none -translate-x-[200%] -translate-y-1/2"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, #FD5E4B 0%, #FDB591 100%)",
        }}
      />
      <div
        className="absolute z-0 left-1/2 top-1/2 w-[140px] h-[140px] rounded-full opacity-20 blur-2xl pointer-events-none translate-x-[140%] -translate-y-1/2"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, #FCCF00 0%, #FD5E4B 100%)",
        }}
      />
      <h1
        className={`relative z-10 text-4xl md:text-6xl font-bold mb-2 tracking-tight text-center bg-linear-to-r from-[#ff9472] to-[#f2709c] text-transparent bg-clip-text transition-all duration-700 ${showH1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} group-hover:scale-105 group-hover:drop-shadow-lg group-hover:duration-300`}
        style={{ letterSpacing: "0.01em" }}
      >
        IDEACREW
      </h1>
      <h2
        className={`relative z-10 text-xl md:text-3xl font-semibold text-gray-700 mb-4 text-center transition-all duration-700 ${showH2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        Build Your Dream Team
      </h2>
      <p
        className={`relative z-10 max-w-2xl text-base md:text-lg text-gray-600 text-center transition-all duration-700 ${showP ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        ร่วมงานกับโปรเจกต์สุดเจ๋งของมหาวิทยาลัย พัฒนาทักษะและสร้างผลงานไปด้วยกัน
      </p>
    </section>
  );
}
