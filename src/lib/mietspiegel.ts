import { RentCheckInput, RentCheckResult } from '@/types';
import { MIETSPIEGEL_DATA } from '@/data/mietspiegel';

// Mietpreisbremse calculation per §556d BGB.
// The legal maximum is the local Vergleichsmiete + 10%.
// We match by city and Wohnlage (location quality) — postcode-level
// granularity would require licensed Mietspiegel data per city.
export function checkRent(input: RentCheckInput): RentCheckResult | null {
  const entry = MIETSPIEGEL_DATA.find(
    (e) =>
      e.city.toLowerCase() === input.city.toLowerCase() &&
      e.wohnlage === input.wohnlage
  );

  // City not in our dataset yet
  if (!entry) return null;

  const vergleichsmiete = entry.eur_per_sqm * input.size_sqm;

  // §556d BGB: new rent cannot exceed Vergleichsmiete by more than 10%
  const legalMax = vergleichsmiete * 1.1;

  const isOverLimit = input.current_rent_eur > legalMax;

  const overpaymentMonthly = isOverLimit
    ? Math.round((input.current_rent_eur - legalMax) * 100) / 100
    : 0;

  return {
    vergleichsmiete: Math.round(vergleichsmiete * 100) / 100,
    legalMax: Math.round(legalMax * 100) / 100,
    currentRent: input.current_rent_eur,
    isOverLimit,
    overpaymentMonthly,
    overpaymentAnnual: Math.round(overpaymentMonthly * 12 * 100) / 100,
    city: input.city,
  };
}