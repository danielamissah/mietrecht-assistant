// Core types shared across the app.
// Keeping them in one file makes it easy to see the full data model at a glance.

export type Language = 'en' | 'de';

// The five dispute types the letter generator supports.
// Each maps to a different system prompt in the API route.
export type DisputeType =
  | 'mietpreisbremse' // rent exceeds legal cap — formal Rüge
  | 'deposit'         // landlord deducted from Kaution unfairly
  | 'repair'          // defect not fixed — Mängelanzeige
  | 'nebenkosten'     // utility bill dispute
  | 'kundigung';      // challenging an eviction notice

export interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  summary: string;
  body: any[]; // Sanity Portable Text blocks
  bgb_references: string[];
  last_reviewed: string;
}

export interface LetterInput {
  disputeType: DisputeType;
  landlordName: string;
  landlordAddress: string;
  tenantName: string;
  tenantAddress: string;
  rentalAddress: string;
  moveInDate: string;
  currentRent: string;
  details: string;
  language: Language;
}

// Mietspiegel data point — one row per city × Wohnlage combination
export interface MietspiegelEntry {
  city: string;
  plz: string[];
  wohnlage: 'einfach' | 'mittel' | 'gut';
  size_range: string;
  eur_per_sqm: number; // ortsübliche Vergleichsmiete per m² per month
  year: number;        // year this Mietspiegel was published
}

export interface RentCheckInput {
  city: string;
  plz: string;
  size_sqm: number;
  wohnlage: 'einfach' | 'mittel' | 'gut';
  current_rent_eur: number;
}

export interface RentCheckResult {
  vergleichsmiete: number;  // total reference rent for this apartment
  legalMax: number;         // Vergleichsmiete + 10% (the Mietpreisbremse ceiling)
  currentRent: number;
  isOverLimit: boolean;
  overpaymentMonthly: number;
  overpaymentAnnual: number;
  city: string;
}