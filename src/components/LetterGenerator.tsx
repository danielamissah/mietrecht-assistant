'use client';

import { useState } from 'react';
import { LetterInput, DisputeType } from '@/types';
import { T } from '@/data/translations';
import { Language } from '@/types';
import { AddressInput } from '@/components/AddressInput';

interface Props {
  t: T;
  lang: Language;
}

// AI letter generator — produces a formal German letter plus an English
// reference version in parallel. The German letter is the one to send;
// the English version helps expats understand what they are signing.
export function LetterGenerator({ t, lang }: Props) {
  const [form, setForm] = useState<LetterInput>({
    disputeType: 'mietpreisbremse',
    landlordName: '',
    landlordAddress: '',
    tenantName: '',
    tenantAddress: '',
    rentalAddress: '',
    moveInDate: '',
    currentRent: '',
    details: '',
    language: lang,
  });

  const [letterDE, setLetterDE] = useState('');
  const [letterEN, setLetterEN] = useState('');
  const [activeTab, setActiveTab] = useState<'de' | 'en'>('de');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function update(key: keyof LetterInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function generate() {
    if (!form.tenantName || !form.landlordName || !form.details) {
      setError('Please fill in your name, landlord name, and situation details.');
      return;
    }
    setError('');
    setLoading(true);
    setLetterDE('');
    setLetterEN('');

    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, language: lang }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Server error');

      setLetterDE(data.letterDE);
      setLetterEN(data.letterEN);
      // Default to German tab — that's the one to send
      setActiveTab('de');
    } catch (e: any) {
      setError(e?.message || 'Failed to generate letter. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function download(content: string, suffix: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mietrecht-${form.disputeType}-${suffix}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    const content = activeTab === 'de' ? letterDE : letterEN;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const disputeOptions = Object.entries(t.disputeTypes) as [DisputeType, string][];
  const hasLetters = letterDE && letterEN;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7 }}>
        {t.letterDesc}
      </p>

      {/* Dispute type selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>{t.letterDisputeType}</label>
        {disputeOptions.map(([key, label]) => (
          <button
            key={key}
            onClick={() => update('disputeType', key)}
            style={{
              padding: '11px 14px', borderRadius: '10px',
              textAlign: 'left', border: '1.5px solid',
              borderColor: form.disputeType === key ? '#0D5C63' : '#E5E7EB',
              background: form.disputeType === key ? '#E6F4F5' : 'white',
              color: form.disputeType === key ? '#0D5C63' : '#4B5563',
              fontSize: '13px',
              fontWeight: form.disputeType === key ? 700 : 400,
              cursor: 'pointer', fontFamily: 'var(--font-open-sans)',
              transition: 'all 0.15s', width: '100%',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Name fields — two column on wider screens, one on mobile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>{t.letterTenantName}</label>
          <input
            type="text"
            value={form.tenantName}
            onChange={(e) => update('tenantName', e.target.value)}
            placeholder={t.letterTenantName}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>{t.letterLandlordName}</label>
          <input
            type="text"
            value={form.landlordName}
            onChange={(e) => update('landlordName', e.target.value)}
            placeholder={t.letterLandlordName}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Address fields — Google Places autocomplete */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
      }}>
        <AddressInput
          label={t.letterTenantAddress}
          value={form.tenantAddress}
          onChange={(val) => update('tenantAddress', val)}
          placeholder="Musterstraße 1, 10115 Berlin"
        />
        <AddressInput
          label={t.letterLandlordAddress}
          value={form.landlordAddress}
          onChange={(val) => update('landlordAddress', val)}
          placeholder="Vermieterstraße 5, 10117 Berlin"
        />
      </div>

      {/* Rental address */}
      <AddressInput
        label={t.letterRentalAddress}
        value={form.rentalAddress}
        onChange={(val) => update('rentalAddress', val)}
        placeholder="Mietstraße 3, 10119 Berlin"
      />

      {/* Move-in date + current rent */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>{t.letterMoveIn}</label>
          <input
            type="date"
            value={form.moveInDate}
            onChange={(e) => update('moveInDate', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>{t.letterCurrentRent}</label>
          <input
            type="number"
            value={form.currentRent}
            onChange={(e) => update('currentRent', e.target.value)}
            placeholder="e.g. 1200"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Situation details — most important field */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>{t.letterDetails}</label>
        <textarea
          value={form.details}
          onChange={(e) => update('details', e.target.value)}
          rows={5}
          placeholder={t.letterDetailsHint}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <p style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic' }}>
        {t.letterLanguageNote}
      </p>

      {error && (
        <div style={{
          background: '#FEF2F2', border: '1.5px solid #FCA5A5',
          borderRadius: '10px', padding: '12px 14px',
        }}>
          <p style={{ fontSize: '13px', color: '#DC2626' }}>{error}</p>
        </div>
      )}

      <button
        onClick={generate}
        disabled={loading}
        style={{
          padding: '14px', borderRadius: '12px', border: 'none',
          background: loading ? '#9CA3AF' : '#0D5C63',
          color: 'white', fontSize: '15px', fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-open-sans)',
          transition: 'background 0.2s', width: '100%',
        }}
      >
        {loading ? t.letterGeneratingBoth : t.letterGenerateBtn}
      </button>

      {/* Letter output — two tabs: German (to send) and English (for reference) */}
      {hasLetters && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: '#F3F4F6',
            borderRadius: '10px', padding: '3px', gap: '3px',
          }}>
            <button
              onClick={() => setActiveTab('de')}
              style={{
                flex: 1, padding: '8px',
                borderRadius: '8px', border: 'none',
                background: activeTab === 'de' ? '#0D5C63' : 'transparent',
                color: activeTab === 'de' ? 'white' : '#6B7280',
                fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-open-sans)',
                transition: 'all 0.15s',
              }}
            >
              {t.letterDE}
            </button>
            <button
              onClick={() => setActiveTab('en')}
              style={{
                flex: 1, padding: '8px',
                borderRadius: '8px', border: 'none',
                background: activeTab === 'en' ? '#0D5C63' : 'transparent',
                color: activeTab === 'en' ? 'white' : '#6B7280',
                fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-open-sans)',
                transition: 'all 0.15s',
              }}
            >
              {t.letterEN}
            </button>
          </div>

          {/* Context note for the active tab */}
          {activeTab === 'de' && (
            <div style={{
              background: '#E6F4F5', borderRadius: '8px',
              padding: '10px 14px', fontSize: '12px', color: '#0D5C63', fontWeight: 600,
            }}>
              This is the letter to send to your landlord. Review it carefully before sending.
            </div>
          )}
          {activeTab === 'en' && (
            <div style={{
              background: '#FEF3E2', borderRadius: '8px',
              padding: '10px 14px', fontSize: '12px', color: '#C07A1A', fontWeight: 600,
            }}>
              This is for your reference only. Do not send this — send the German version.
            </div>
          )}

          {/* Letter content — serif font matches a real formal letter */}
          <div style={{
            background: '#F9FAFB', border: '1px solid #E5E7EB',
            borderRadius: '12px', padding: '20px',
            fontFamily: 'Georgia, serif', fontSize: '13px',
            lineHeight: 1.9, color: '#1A1A1A', whiteSpace: 'pre-wrap',
            maxHeight: '500px', overflowY: 'auto',
          }}>
            {activeTab === 'de' ? letterDE : letterEN}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => download(letterDE, 'DE')}
              style={{ ...actionBtnStyle('#0D5C63'), flex: '1 1 140px' }}
            >
              {t.letterDownloadDE}
            </button>
            <button
              onClick={() => download(letterEN, 'EN')}
              style={{ ...actionBtnStyle('#F4A035'), flex: '1 1 140px' }}
            >
              {t.letterDownloadEN}
            </button>
            <button
              onClick={copy}
              style={{ ...actionBtnStyle(copied ? '#22C55E' : '#6B7280'), flex: '1 1 100px' }}
            >
              {copied ? t.letterCopied : t.letterCopy}
            </button>
          </div>

          <p style={{ fontSize: '11px', color: '#9CA3AF', lineHeight: 1.6 }}>
            {t.letterDisclaimer}
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1.5px solid #E5E7EB',
  fontSize: '14px',
  color: '#1A1A1A',
  background: 'white',
  fontFamily: 'var(--font-open-sans)',
};

const actionBtnStyle = (bg: string): React.CSSProperties => ({
  padding: '11px',
  borderRadius: '10px',
  border: 'none',
  background: bg,
  color: 'white',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'var(--font-open-sans)',
  transition: 'background 0.2s',
  textAlign: 'center',
});