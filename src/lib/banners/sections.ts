/** Promo banner placement keys — keep in sync with adminpanel-repairseries catalog. */
export const BANNER_SECTIONS = [
  { id: "home", label: "Home" },
  { id: "offers", label: "Offers" },
  { id: "services", label: "Services" },
  { id: "bookings", label: "Bookings" },
  { id: "account", label: "Account" },
  { id: "cart", label: "Cart" },
  { id: "search", label: "Search" },
  { id: "category", label: "Category page" },
  { id: "service_details", label: "Service details" },
  { id: "popular_services", label: "Popular Services" },
  { id: "featured", label: "Featured Services" },
  { id: "categories", label: "Categories (home)" },
  { id: "coming_soon", label: "Coming Soon" },
  { id: "coming_soon_main", label: "Coming Soon — Main" },
  { id: "coming_soon_commercial", label: "Coming Soon — Commercial" },
  { id: "ac", label: "AC" },
  { id: "washing_machine", label: "Washing Machine" },
  { id: "kitchen_appliances", label: "Kitchen Appliances" },
  { id: "cleaning", label: "Cleaning" },
  { id: "commercial", label: "Commercial" },
] as const;

export type BannerSectionId = (typeof BANNER_SECTIONS)[number]["id"];

export function normalizeBannerSection(raw: unknown): string {
  const s = String(raw || "home")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  const aliases: Record<string, string> = {
    homepage: "home",
    home_page: "home",
    offer: "offers",
    promo: "offers",
    service: "services",
    booking: "bookings",
    my_bookings: "bookings",
    profile: "account",
    category_page: "category",
    category_services: "category",
    service_detail: "service_details",
    servicedetails: "service_details",
    popular: "popular_services",
    featured_services: "featured",
    comingsoon: "coming_soon",
  };
  return aliases[s] || s || "home";
}
