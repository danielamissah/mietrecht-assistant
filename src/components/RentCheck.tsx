'use client';

import { useState } from 'react';
import { checkRent } from '@/lib/mietspiegel';
import { SUPPORTED_CITIES } from '@/data/mietspiegel';
import { RentCheckResult } from '@/types';
import { T } from '@/data/translations';

interface Props {
  t: T;
}

// Mietpreisbremse calculator (§556d BGB).
// User inputs city, apartment size, Wohnlage (location quality), and current rent.
// We compare against our Mietspiegel dataset and show whether they are within
// the legal limit — and if not, the monthly and annual overpayment.
export function RentCheck({ t }: Props) {
  const [city, setCity] = useState('berlin');
  const [size, setSize] = useState(60);
  const [wohnlage, setWohnlage] = useState<'einfach' | 'mittel' | 'gut'>('mittel');
  const [rent, setRent] = useState(1000);
  const [result, setResult] = useState<RentCheckResult | null>(null);
  const [notSupported, setNotSupported] = useState(false);

  function handleCheck() {
    const r = checkRent({ city, plz: '', size_sqm: size, wohnlage, current_rent_eur: rent });
    if (!r) {
      setNotSupported(true);
      setResult(null);
      return;
    }
    setNotSupported(false);
    setResult(r);
  }

  // German locale formatting for currency output
  const fmt = (n: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);

  // Dynamic slider fill — orange left of thumb, grey right.
  // Applied via inline style because CSS alone cannot style the filled
  // portion of a range input cross-browser.
  const sizePct = ((size - 20) / (200 - 20)) * 100;
  const rentPct = ((rent - 200) / (5000 - 200)) * 100;
  const sliderFill = (pct: number): React.CSSProperties => ({
    background: `linear-gradient(to right, #F4A035 ${pct}%, #D1D5DB ${pct}%)`,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7 }}>
        {t.rentCheckDesc}
      </p>

      {/* City selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>{t.rentCheckCity}</label>
        <select value={city} onChange={(e) => setCity(e.target.value)} style={selectStyle}>
          {SUPPORTED_CITIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Apartment size slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={labelStyle}>{t.rentCheckSize}</label>
          <span style={valueBadge}>{size} m²</span>
        </div>
        <input
          type="range" min={20} max={200} step={5} value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          style={sliderFill(sizePct)}
        />
      </div>

      {/* Current rent slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={labelStyle}>{t.rentCheckCurrentRent}</label>
          <span style={valueBadge}>{fmt(rent)}</span>
        </div>
        <input
          type="range" min={200} max={5000} step={50} value={rent}
          onChange={(e) => setRent(Number(e.target.value))}
          style={sliderFill(rentPct)}
        />
      </div>

      {/* Wohnlage toggle — three options shown as buttons rather than a dropdown
          because the three values need visible labels and are mutually exclusive.
          On very small screens they stack to two rows via flex-wrap. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>{t.rentCheckWohnlage}</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['einfach', 'mittel', 'gut'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setWohnlage(w)}
              style={{
                flex: '1 1 80px',
                padding: '9px 4px',
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: wohnlage === w ? '#0D5C63' : '#E5E7EB',
                background: wohnlage === w ? '#E6F4F5' : 'white',
                color: wohnlage === w ? '#0D5C63' : '#6B7280',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-open-sans)',
                transition: 'all 0.15s',
                textAlign: 'center',
              }}
            >
              {w === 'einfach'
                ? t.wohnlageEinfach
                : w === 'mittel'
                ? t.wohnlageMittel
                : t.wohnlageGut}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleCheck}
        style={{
          padding: '13px', borderRadius: '12px', border: 'none',
          background: '#0D5C63', color: 'white',
          fontSize: '15px', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'var(--font-open-sans)',
          width: '100%',
        }}
      >
        {t.rentCheckBtn}
      </button>

      {/* City not in Mietspiegel dataset yet */}
      {notSupported && (
        <div style={{
          background: '#FEF3E2', border: '1.5px solid #F4A035',
          borderRadius: '12px', padding: '14px 16px',
        }}>
          <p style={{ fontSize: '13px', color: '#92400E' }}>{t.cityNotSupported}</p>
        </div>
      )}

      {/* Result card — green border if within limit, amber if over */}
      {result && (
        <div style={{
          background: result.isOverLimit ? '#FFF7ED' : '#F0FDF4',
          border: `1.5px solid ${result.isOverLimit ? '#F4A035' : '#22C55E'}`,
          borderRadius: '16px', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <p style={{
            fontWeight: 700, fontSize: '15px',
            color: result.isOverLimit ? '#B45309' : '#15803D',
          }}>
            {result.isOverLimit ? t.rentCheckResultIllegal : t.rentCheckResultLegal}
          </p>

          {[
            [t.vergleichsmiete, fmt(result.vergleichsmiete)],
            [t.legalMax, fmt(result.legalMax)],
            [t.yourRent, fmt(result.currentRent)],
            ...(result.isOverLimit
              ? [
                  [t.overpaymentMonthly, fmt(result.overpaymentMonthly)],
                  [t.overpaymentAnnual, fmt(result.overpaymentAnnual)],
                ]
              : []),
          ].map(([label, value]) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '8px 0',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              gap: '8px',
            }}>
              <span style={{ fontSize: '13px', color: '#4B5563', flexShrink: 1 }}>{label}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0D5C63', flexShrink: 0 }}>
                {value}
              </span>
            </div>
          ))}

          <p style={{ fontSize: '11px', color: '#9CA3AF', lineHeight: 1.6, marginTop: '4px' }}>
            {t.rentCheckDisclaimer}
          </p>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1.5px solid #E5E7EB',
  fontSize: '14px',
  color: '#1A1A1A',
  background: 'white',
  fontFamily: 'var(--font-open-sans)',
  cursor: 'pointer',
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
};

const valueBadge: React.CSSProperties = {
  padding: '4px 12px',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: 800,
  background: '#FEF3E2',
  color: '#C07A1A',
  whiteSpace: 'nowrap',
};