"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, limit, onSnapshot, query } from "firebase/firestore";
import { Container } from "@/components/container";
import { getDb } from "@/lib/firebase/firestore";
import { normalizeBannerSection } from "@/lib/banners/sections";

type BannerDoc = {
  id: string;
  title?: string;
  section?: string;
  mobileImage?: string;
  websiteImage?: string;
  image?: string;
  imageUrl?: string;
  redirectLink?: string;
  link?: string;
  displayOrder?: number;
  enabled?: boolean;
  active?: boolean;
  startAt?: unknown;
  endAt?: unknown;
  _src?: string;
};

function bannerScheduleActive(o: BannerDoc, now = Date.now()): boolean {
  const toMillis = (raw: unknown): number | null => {
    if (!raw) return null;
    if (typeof (raw as { toDate?: () => Date })?.toDate === "function") {
      const d = (raw as { toDate: () => Date }).toDate();
      return d && !Number.isNaN(d.getTime()) ? d.getTime() : null;
    }
    if (typeof raw === "object" && raw !== null && "seconds" in raw) {
      return Number((raw as { seconds: number }).seconds) * 1000;
    }
    const t = new Date(raw as string | number | Date).getTime();
    return Number.isFinite(t) ? t : null;
  };
  const start = toMillis(o.startAt);
  const end = toMillis(o.endAt);
  if (start != null && now < start) return false;
  if (end != null && now > end) return false;
  return true;
}

type NormalizedBanner = BannerDoc & {
  image: string;
  section: string;
  enabled: boolean;
  href: string;
  order: number;
};

function normalize(
  rows: BannerDoc[],
  preferWebsite: boolean,
  sections: string[] | null,
): NormalizedBanner[] {
  const wanted = sections
    ? new Set(sections.map((s) => normalizeBannerSection(s)))
    : null;

  return rows
    .map((o) => {
      const image = preferWebsite
        ? o.websiteImage || o.image || o.imageUrl || o.mobileImage || ""
        : o.mobileImage || o.image || o.imageUrl || o.websiteImage || "";
      const section = normalizeBannerSection(
        o.section || (o._src === "offers" ? "offers" : "home"),
      );
      return {
        ...o,
        image,
        section,
        enabled: o.enabled !== false && o.active !== false,
        href: o.redirectLink || o.link || "/services",
        order: Number(o.displayOrder ?? 999),
      };
    })
    .filter((o) => o.enabled && o.image)
    .filter((o) => bannerScheduleActive(o))
    .filter((o) => (wanted ? wanted.has(o.section) : true))
    .sort((a, b) => a.order - b.order);
}

/** Same mobile carousel card used on home top + every section. */
function MobileBannerCard({ banner }: { banner: NormalizedBanner }) {
  return (
    <Link
      href={banner.href}
      className="relative h-[172px] w-[min(100%,340px)] shrink-0 snap-center overflow-hidden rounded-[20px] bg-[#E7E5E4] shadow-[0_12px_28px_rgba(8,15,28,0.12)] transition active:scale-[0.985]"
      aria-label={banner.title || "Promotional banner"}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.image}
        alt={banner.title || "Offer"}
        className="h-full w-full object-cover"
      />
    </Link>
  );
}

type PromoBannerSectionProps = {
  section?: string | string[];
  mobileOnly?: boolean;
  className?: string;
};

export function PromoBannerSection({
  section = ["home", "offers"],
  mobileOnly = false,
  className = "",
}: PromoBannerSectionProps) {
  const [rows, setRows] = useState<BannerDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const sections = useMemo(() => {
    if (section == null) return null;
    return Array.isArray(section) ? section : [section];
  }, [section]);

  useEffect(() => {
    const db = getDb();
    if (!db) {
      setLoading(false);
      return;
    }
    let offers: BannerDoc[] = [];
    let banners: BannerDoc[] = [];
    const emit = () => {
      setRows([...banners, ...offers]);
      setLoading(false);
    };
    const u1 = onSnapshot(query(collection(db, "banners"), limit(40)), (snap) => {
      banners = snap.docs.map((d) => ({ id: d.id, ...d.data(), _src: "banners" }) as BannerDoc);
      emit();
    });
    const u2 = onSnapshot(query(collection(db, "offers"), limit(40)), (snap) => {
      offers = snap.docs.map((d) => ({ id: d.id, ...d.data(), _src: "offers" }) as BannerDoc);
      emit();
    });
    return () => {
      u1();
      u2();
    };
  }, []);

  const list = useMemo(() => normalize(rows, true, sections), [rows, sections]);
  const mobileList = useMemo(() => normalize(rows, false, sections), [rows, sections]);

  if (loading && !list.length && !mobileList.length) {
    return (
      <section className={`py-3 md:py-12 ${className}`}>
        {mobileOnly ? (
          <div className="mx-4 h-[172px] animate-pulse rounded-[20px] bg-[#E8E4E0] md:hidden" />
        ) : (
          <Container>
            <div className="h-[160px] animate-pulse rounded-[20px] bg-[#E8E4E0] md:h-[280px] md:rounded-[24px]" />
          </Container>
        )}
      </section>
    );
  }

  if (!list.length && !mobileList.length) return null;

  const mobileItems = mobileList.length ? mobileList : list;

  return (
    <>
      {/* Same carousel style as top home banner */}
      <section className={`px-4 py-3 md:hidden ${className}`}>
        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {mobileItems.map((b) => (
            <MobileBannerCard key={b.id} banner={b} />
          ))}
        </div>
      </section>

      {!mobileOnly && list[0] ? (
        <section className={`hidden py-12 md:block ${className}`}>
          <Container>
            <Link
              href={list[0].href || "/services"}
              className="relative block min-h-[280px] overflow-hidden rounded-[28px] border border-black/5 bg-[#E7E5E4] shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
              aria-label={list[0].title || "Promotional banner"}
            >
              {list[0].image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={list[0].image}
                  alt={list[0].title || "Offer"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
            </Link>
          </Container>
        </section>
      ) : null}
    </>
  );
}

/** Same carousel as home top — for any section placement. */
export function SectionPromoBanner({
  section,
  className,
}: {
  section: string | string[];
  className?: string;
}) {
  return (
    <PromoBannerSection section={section} mobileOnly className={className} />
  );
}
