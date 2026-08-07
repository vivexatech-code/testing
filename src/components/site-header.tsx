"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/container";
import { HeaderAuth } from "@/components/header-auth";
import { HeaderCartButton } from "@/components/header/header-cart";
import { HeaderLocationDropdown } from "@/components/header/header-location";
import { HeaderSearch } from "@/components/header/header-search";
import { Search } from "lucide-react";

export function SiteHeader() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E4E0] bg-[#F8F6F4]/95 backdrop-blur md:border-gray-200 md:bg-white">
      <Container className="flex h-[64px] items-center justify-between gap-3 md:h-[72px] lg:gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-85"
          >
            <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
              <img
                src="/web-app-manifest-192x192.png"
                alt="Repair Series"
                className="size-10"
              />
            </div>
            <div className="hidden flex-col text-[15px] font-bold leading-[1.1] text-black sm:flex">
              <span>Repair</span>
              <span>Series</span>
            </div>
          </Link>
          <div className="min-w-0 flex-1 md:hidden">
            <HeaderLocationDropdown />
          </div>
        </div>

        <div className="hidden flex-1 items-center gap-4 lg:flex lg:px-6">
          <HeaderLocationDropdown />
          <HeaderSearch />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-full border border-[#E8E4E0] bg-white text-[#C45508] lg:hidden"
          >
            <Search className="size-5" />
          </button>
          <HeaderCartButton />
          <div className="hidden md:block">
            <HeaderAuth />
          </div>
        </div>
      </Container>

      {mobileSearchOpen ? (
        <div className="border-t border-[#E8E4E0] bg-white px-4 py-3 animate-in slide-in-from-top-2 duration-200 md:border-gray-100 lg:hidden">
          <HeaderSearch />
        </div>
      ) : null}
    </header>
  );
}
