"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  Search,
  MapPin,
  Wrench,
  CalendarDays,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import {
  PromoBannerSection,
  SectionPromoBanner,
} from "@/components/home/promo-banner";
import {
  BookingApprovalBanner,
  BookingPaymentHomeBanner,
} from "@/components/home/booking-home-banners";
import { getDb } from "@/lib/firebase/firestore";
import { useLocation } from "@/context/location-context";
import { useAuth } from "@/hooks/use-auth";
import { getCategoryPath, getComingSoonPath, getServicePath } from "@/lib/catalog/slug";
import { splitComingSoonByCategory } from "@/lib/catalog/coming-soon";
import { ServicePrice } from "@/components/services/service-price";
import type { BookingDoc } from "@/lib/booking/types";
import { useGuestBrowse } from "@/context/guest-browse-context";

type CategoryDoc = {
  id: string;
  name?: string;
  title?: string;
  icon?: string;
  active?: boolean;
  isActive?: boolean;
};

type ServiceDoc = {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  categoryId?: string;
  status?: string;
  comingSoonCategory?: string;
  price?: number;
  image?: string;
  imageUrl?: string;
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Phone-width home that mirrors the Repair Series user app shell.
 */
export function MobileAppHome() {
  const { user, customer } = useAuth();
  const { getLoginHref, endGuestBrowse } = useGuestBrowse();
  const { label } = useLocation();
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [services, setServices] = useState<ServiceDoc[]>([]);
  const [comingSoon, setComingSoon] = useState<ServiceDoc[]>([]);
  const [bookings, setBookings] = useState<BookingDoc[]>([]);

  useEffect(() => {
    const db = getDb();
    if (!db) return;
    void getDocs(query(collection(db, "categories"), orderBy("name", "asc"))).then((snap) => {
      setCategories(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as CategoryDoc)
          .filter((c) => c.active !== false && c.isActive !== false),
      );
    });
    void getDocs(query(collection(db, "services"), orderBy("name", "asc"))).then((snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ServiceDoc);
      setServices(all.filter((s) => String(s.status || "Active") === "Active"));
    });
    const unsub = onSnapshot(
      query(collection(db, "services"), where("status", "==", "Coming Soon")),
      (snap) => {
        setComingSoon(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }) as ServiceDoc & { previewStatus?: string })
            .filter(
              (s) => String(s.previewStatus ?? "Active") !== "Inactive",
            ),
        );
      },
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setBookings([]);
      return;
    }
    const db = getDb();
    if (!db) return;
    const unsub = onSnapshot(
      query(collection(db, "bookings"), where("customerId", "==", user.uid)),
      (snap) => {
        setBookings(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingDoc),
        );
      },
      () => setBookings([]),
    );
    return () => unsub();
  }, [user?.uid]);

  const accountHref = user ? "/dashboard" : getLoginHref("/dashboard");
  const bookingsHref = user
    ? "/dashboard/bookings"
    : getLoginHref("/dashboard/bookings");

  const firstName = useMemo(() => {
    const n = String(customer?.name || "").trim();
    return n ? n.split(/\s+/)[0] : null;
  }, [customer?.name]);

  const { main: comingSoonMain, commercial: comingSoonCommercial } = useMemo(
    () => splitComingSoonByCategory(comingSoon),
    [comingSoon],
  );

  const featured = services.slice(0, 8);

  return (
    <div className="min-h-[100dvh] bg-[#F8F6F4] pb-4 md:hidden">
      <div className="bg-gradient-to-b from-[#C45508] to-[#E07A35] px-4 pb-5 pt-3 text-white">
        <button
          type="button"
          className="mb-3 flex max-w-full items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-left text-xs font-semibold backdrop-blur"
        >
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{label || "Set your service location"}</span>
        </button>
        <p className="text-sm font-semibold text-white/90">{greeting()}</p>
        <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight">
          {firstName ? `Hi, ${firstName}` : "Repair Series"}
        </h1>
        <Link
          href="/search"
          className="mt-4 flex h-12 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-[#6B6B6B] shadow-sm"
        >
          <Search className="size-5 text-[#C45508]" />
          Search services…
        </Link>
      </div>

      <PromoBannerSection section={["home", "offers"]} mobileOnly />

      {user ? (
        <>
          <BookingPaymentHomeBanner bookings={bookings} />
          <BookingApprovalBanner bookings={bookings} />
        </>
      ) : null}

      <div className="mt-2 grid grid-cols-4 gap-2 px-4">
        {(
          [
            { href: "/services", label: "Services", Icon: Wrench },
            {
              href: bookingsHref,
              label: "Bookings",
              Icon: CalendarDays,
            },
            { href: "/cart", label: "Cart", Icon: ShoppingCart },
            { href: accountHref, label: "Account", Icon: UserRound },
          ] as const
        ).map((a) => (
          <Link
            key={a.label}
            href={a.href}
            onClick={() => {
              if (!user && (a.label === "Account" || a.label === "Bookings")) {
                endGuestBrowse();
              }
            }}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 text-center shadow-sm ring-1 ring-[#E8E4E0] transition active:scale-[0.97]"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#FDE7DD] text-[#C45508]">
              <a.Icon className="size-5" />
            </span>
            <span className="text-[11px] font-bold text-[#1A1A1A]">{a.label}</span>
          </Link>
        ))}
      </div>

      <section className="mt-6 px-4">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-extrabold text-[#1A1A1A]">Categories</h2>
          <Link href="/categories" className="text-xs font-bold text-[#C45508]">
            See all
          </Link>
        </div>
        <div className="-mx-4 mb-3">
          <SectionPromoBanner section="categories" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {categories.slice(0, 8).map((c) => (
            <Link
              key={c.id}
              href={getCategoryPath(c)}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E8E4E0]">
                {c.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.icon} alt="" className="size-10 object-contain" />
                ) : (
                  <span className="text-lg">🔧</span>
                )}
              </div>
              <span className="line-clamp-2 text-center text-[11px] font-bold text-[#1A1A1A]">
                {c.name || c.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7 px-4">
        <h2 className="mb-3 text-lg font-extrabold text-[#1A1A1A]">Popular services</h2>
        <div className="-mx-4 mb-3">
          <SectionPromoBanner section="popular_services" />
        </div>
        <div className="-mx-4 mb-3">
          <SectionPromoBanner section="featured" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {featured.map((s) => (
            <Link
              key={s.id}
              href={getServicePath(s)}
              className="w-[148px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E8E4E0]"
            >
              <div className="aspect-[4/3] bg-[#F4F5F7]">
                {(s.image || s.imageUrl) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.image || s.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-2.5">
                <p className="line-clamp-2 text-xs font-bold text-[#1A1A1A]">
                  {s.name || s.title}
                </p>
                <div className="mt-1 text-[11px] font-semibold text-[#C45508]">
                  <ServicePrice service={s as never} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {comingSoonMain.length ? (
        <section className="mt-7 px-4">
          <h2 className="mb-3 text-lg font-extrabold text-[#1A1A1A]">
            Coming Soon — Main
          </h2>
          <div className="-mx-4 mb-3">
            <SectionPromoBanner
              section={["coming_soon_main", "coming_soon"]}
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {comingSoonMain.slice(0, 6).map((s) => (
              <Link
                key={s.id}
                href={getComingSoonPath(s)}
                className="w-[140px] shrink-0 rounded-2xl bg-white p-3 opacity-80 shadow-sm ring-1 ring-[#E8E4E0]"
              >
                <p className="line-clamp-2 text-xs font-bold">{s.name || s.title}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase text-[#C45508]">
                  Main
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {comingSoonCommercial.length ? (
        <section className="mt-7 px-4">
          <h2 className="mb-3 text-lg font-extrabold text-[#1A1A1A]">
            Coming Soon — Commercial
          </h2>
          <div className="-mx-4 mb-3">
            <SectionPromoBanner section="coming_soon_commercial" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {comingSoonCommercial.slice(0, 6).map((s) => (
              <Link
                key={s.id}
                href={getComingSoonPath(s)}
                className="w-[140px] shrink-0 rounded-2xl bg-white p-3 opacity-80 shadow-sm ring-1 ring-[#E8E4E0]"
              >
                <p className="line-clamp-2 text-xs font-bold">{s.name || s.title}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase text-[#C45508]">
                  Commercial
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
