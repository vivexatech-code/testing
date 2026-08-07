export const SITE_URL = "https://www.repairseries.in";
export const SITE_NAME = "Repair Series";

export const SERVICE_CITIES = ["Gurugram", "Hyderabad", "Aligarh"] as const;
export type ServiceCity = (typeof SERVICE_CITIES)[number];

export const SEO_KEYWORDS = [
  "AC Repair",
  "Chimney Cleaning",
  "Washing Machine Repair",
  "RO Service",
  "Refrigerator Repair",
  "Microwave Repair",
  "Electrician",
  "Plumber",
  "Geyser Repair",
  "TV Repair",
  "Deep Cleaning",
  "Appliance Repair",
] as const;

export function cityServiceTitle(service: string, city: ServiceCity): string {
  return `${service} in ${city}`;
}

export function buildDefaultDescription(city?: ServiceCity): string {
  const cities = city ? [city] : [...SERVICE_CITIES];
  const cityPhrase = cities.join(", ");
  return `Book trusted home appliance repair and cleaning in ${cityPhrase}. Same-day AC repair, washing machine service, RO service, electrician, plumber & more. Verified technicians, transparent pricing.`;
}

export function buildDefaultTitle(city?: ServiceCity): string {
  if (city) {
    return `Home Appliance Repair & Cleaning in ${city} | ${SITE_NAME}`;
  }
  return `Home Appliance Repair in Gurugram, Hyderabad & Aligarh | ${SITE_NAME}`;
}
