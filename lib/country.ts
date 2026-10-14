/**
 * Country normalization utilities for CSwithBS.
 * Resolves both 2-letter ISO codes and full country names into standard codes and display names.
 */

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

// Comprehensive mapping from country names (lowercase) to ISO 3166-1 alpha-2 codes
const NAME_TO_ISO: Record<string, string> = {
  // Common aliases & popular countries
  "india": "IN",
  "united states": "US",
  "united states of america": "US",
  "usa": "US",
  "us": "US",
  "united kingdom": "GB",
  "great britain": "GB",
  "uk": "GB",
  "singapore": "SG",
  "china": "CN",
  "the netherlands": "NL",
  "netherlands": "NL",
  "holland": "NL",
  "france": "FR",
  "germany": "DE",
  "mexico": "MX",
  "philippines": "PH",
  "hong kong": "HK",
  "colombia": "CO",
  "brazil": "BR",
  "sweden": "SE",
  "south korea": "KR",
  "korea, republic of": "KR",
  "taiwan": "TW",
  "canada": "CA",
  "poland": "PL",
  "australia": "AU",
  "new zealand": "NZ",
  "indonesia": "ID",
  "ecuador": "EC",
  "nigeria": "NG",
  "austria": "AT",
  "kenya": "KE",
  "pakistan": "PK",
  "bolivia": "BO",
  "united arab emirates": "AE",
  "uae": "AE",
  "greece": "GR",
  "finland": "FI",
  "japan": "JP",
  "spain": "ES",
  "italy": "IT",
  "russia": "RU",
  "russian federation": "RU",
  "bangladesh": "BD",
  "sri lanka": "LK",
  "nepal": "NP",
  "vietnam": "VN",
  "viet nam": "VN",
  "thailand": "TH",
  "malaysia": "MY",
  "south africa": "ZA",
  "egypt": "EG",
  "turkey": "TR",
  "türkiye": "TR",
  "switzerland": "CH",
  "norway": "NO",
  "denmark": "DK",
  "ireland": "IE",
  "belgium": "BE",
  "portugal": "PT",
  "argentina": "AR",
  "chile": "CL",
  "peru": "PE",
  "saudi arabia": "SA",
  "israel": "IL",
  "ukraine": "UA",
  "czech republic": "CZ",
  "czechia": "CZ",
  "romania": "RO",
  "hungary": "HU",
};

/**
 * Converts any country input (full name or ISO code) to an uppercase 2-letter ISO code.
 * Falls back to "UN" (Unknown) if unresolvable.
 */
export function countryToIso2(input?: string | null): string {
  if (!input) return "UN";
  const trimmed = input.trim();
  if (trimmed.length === 2) {
    return trimmed.toUpperCase();
  }

  const lower = trimmed.toLowerCase();
  if (NAME_TO_ISO[lower]) {
    return NAME_TO_ISO[lower];
  }

  // Fallback: try to match partial or normalized words
  const sanitized = lower.replace(/^(the|republic of)\s+/i, "");
  if (NAME_TO_ISO[sanitized]) {
    return NAME_TO_ISO[sanitized];
  }

  return "UN";
}

/**
 * Converts an ISO code or full name to the standardized full English country name.
 */
export function iso2ToCountry(isoCodeOrName?: string | null): string {
  if (!isoCodeOrName) return "Unknown";
  const code = countryToIso2(isoCodeOrName);
  if (code !== "UN") {
    try {
      return regionNames.of(code) || isoCodeOrName;
    } catch {
      return isoCodeOrName;
    }
  }
  return isoCodeOrName;
}

/**
 * Normalizes any country input into both a valid ISO 2-letter code and standardized display name.
 */
export function normalizeCountry(input?: string | null): { code: string; name: string } {
  if (!input || input.toLowerCase() === "unknown") {
    return { code: "UN", name: "Unknown" };
  }

  const code = countryToIso2(input);
  if (code !== "UN") {
    let name = input;
    try {
      name = regionNames.of(code) || input;
    } catch {
      name = input;
    }
    return { code, name };
  }

  return { code: "UN", name: input };
}
