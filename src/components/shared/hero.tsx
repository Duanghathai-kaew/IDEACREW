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
    <section className="relative flex w-full min-w-0 flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14 md:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-32 w-32 -translate-x-[120%] -translate-y-1/2 rounded-full opacity-20 blur-2xl sm:h-36 sm:w-36 sm:-translate-x-[160%] md:-translate-x-[200%]"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, #FD5E4B 0%, #FDB591 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-28 w-28 translate-x-[80%] -translate-y-1/2 rounded-full opacity-20 blur-2xl sm:h-32 sm:w-32 sm:translate-x-[120%] md:translate-x-[140%]"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, #FCCF00 0%, #FD5E4B 100%)",
        }}
      />
      <h1
        className={`relative z-10 mb-2 bg-linear-to-r from-[#ff9472] to-[#f2709c] bg-clip-text text-center text-3xl font-bold tracking-tight text-transparent transition-all duration-700 sm:text-4xl md:text-5xl lg:text-6xl ${showH1 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      >
        IDEACREW
      </h1>
      <h2
        className={`relative z-10 mb-3 text-center text-lg font-semibold text-gray-700 transition-all duration-700 sm:mb-4 sm:text-xl md:text-2xl lg:text-3xl ${showH2 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      >
        Build Your Dream Team
      </h2>
      <p
        className={`relative z-10 max-w-2xl px-2 text-center text-sm text-gray-600 transition-all duration-700 sm:text-base md:text-lg ${showP ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      >
        ร่วมงานกับโปรเจกต์สุดเจ๋งของมหาวิทยาลัย พัฒนาทักษะและสร้างผลงานไปด้วยกัน
      </p>
    </section>
  );
}
