import { MietspiegelEntry } from '@/types';

// Ortsübliche Vergleichsmiete (€/sqm/month)
// Sources: Berlin IMV 2023, Münchner Mietspiegel 2023,
// Hamburg Mietenspiegel 2023, Frankfurt Mietspiegel 2022
export const MIETSPIEGEL_DATA: MietspiegelEntry[] = [
  // Berlin
  { city: 'berlin', plz: [], wohnlage: 'einfach', size_range: 'all', eur_per_sqm: 7.21, year: 2023 },
  { city: 'berlin', plz: [], wohnlage: 'mittel', size_range: 'all', eur_per_sqm: 8.94, year: 2023 },
  { city: 'berlin', plz: [], wohnlage: 'gut', size_range: 'all', eur_per_sqm: 11.50, year: 2023 },
  // Munich
  { city: 'munich', plz: [], wohnlage: 'einfach', size_range: 'all', eur_per_sqm: 17.20, year: 2023 },
  { city: 'munich', plz: [], wohnlage: 'mittel', size_range: 'all', eur_per_sqm: 20.10, year: 2023 },
  { city: 'munich', plz: [], wohnlage: 'gut', size_range: 'all', eur_per_sqm: 24.30, year: 2023 },
  // Hamburg
  { city: 'hamburg', plz: [], wohnlage: 'einfach', size_range: 'all', eur_per_sqm: 10.20, year: 2023 },
  { city: 'hamburg', plz: [], wohnlage: 'mittel', size_range: 'all', eur_per_sqm: 13.40, year: 2023 },
  { city: 'hamburg', plz: [], wohnlage: 'gut', size_range: 'all', eur_per_sqm: 16.80, year: 2023 },
  // Frankfurt
  { city: 'frankfurt', plz: [], wohnlage: 'einfach', size_range: 'all', eur_per_sqm: 11.50, year: 2022 },
  { city: 'frankfurt', plz: [], wohnlage: 'mittel', size_range: 'all', eur_per_sqm: 14.20, year: 2022 },
  { city: 'frankfurt', plz: [], wohnlage: 'gut', size_range: 'all', eur_per_sqm: 17.60, year: 2022 },
  // Cologne
  { city: 'cologne', plz: [], wohnlage: 'einfach', size_range: 'all', eur_per_sqm: 10.80, year: 2022 },
  { city: 'cologne', plz: [], wohnlage: 'mittel', size_range: 'all', eur_per_sqm: 13.10, year: 2022 },
  { city: 'cologne', plz: [], wohnlage: 'gut', size_range: 'all', eur_per_sqm: 15.90, year: 2022 },
  // Stuttgart
  { city: 'stuttgart', plz: [], wohnlage: 'einfach', size_range: 'all', eur_per_sqm: 13.20, year: 2022 },
  { city: 'stuttgart', plz: [], wohnlage: 'mittel', size_range: 'all', eur_per_sqm: 15.80, year: 2022 },
  { city: 'stuttgart', plz: [], wohnlage: 'gut', size_range: 'all', eur_per_sqm: 18.40, year: 2022 },
  // Düsseldorf
  { city: 'dusseldorf', plz: [], wohnlage: 'einfach', size_range: 'all', eur_per_sqm: 10.40, year: 2022 },
  { city: 'dusseldorf', plz: [], wohnlage: 'mittel', size_range: 'all', eur_per_sqm: 12.90, year: 2022 },
  { city: 'dusseldorf', plz: [], wohnlage: 'gut', size_range: 'all', eur_per_sqm: 15.60, year: 2022 },
];

export const SUPPORTED_CITIES = [
  { id: 'berlin', name: 'Berlin' },
  { id: 'munich', name: 'Munich (München)' },
  { id: 'hamburg', name: 'Hamburg' },
  { id: 'frankfurt', name: 'Frankfurt' },
  { id: 'cologne', name: 'Cologne (Köln)' },
  { id: 'stuttgart', name: 'Stuttgart' },
  { id: 'dusseldorf', name: 'Düsseldorf' },
];