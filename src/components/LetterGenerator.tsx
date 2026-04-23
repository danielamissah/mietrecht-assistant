'use client';

import { useState } from 'react';
import { LetterInput, DisputeType } from '@/types';
import { T } from '@/data/translations';
import { Language } from '@/hooks/useTranslation';

interface Props {
  t: T;
  lang: Language;
}

// AI-powered letter generator.
// The user picks their dispute type and fills in basic details.
// We POST to /api/generate-letter which calls GPT-4o with a
// dispute-specific system prompt grounded in the correct BGB paragraphs.
// Temperature is kept low (0.3) so legal citations stay consistent.
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

  const [letter, setLetter] = useState('');
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
    setLetter('');
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, language: lang }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Server error');
      setLetter(data.letter);
    } catch (e: any) {
      setError(e?.message || 'Failed to generate letter. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Plain text download — universally readable, easy to paste into Word or email
  function download() {
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mietrecht-${form.disputeType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const disputeOptions = Object.entries(t.disputeTypes) as [DisputeType, string][];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7 }}>
        {t.letterDesc}
      </p>

      {/* Dispute type — full-width button list so each option is fully readable
          on any screen width. A dropdown would truncate the long German labels. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>{t.letterDisputeType}</label>
        {disputeOptions.map(([key, label]) => (
          <button
            key={key}
            onClick={() => update('disputeType', key)}
            style={{
              padding: '11px 14px',
              borderRadius: '10px',
              textAlign: 'left',
              border: '1.5px solid',
              borderColor: form.disputeType === key ? '#0D5C63' : '#E5E7EB',
              background: form.disputeType === key ? '#E6F4F5' : 'white',
              color: form.disputeType === key ? '#0D5C63' : '#4B5563',
              fontSize: '13px',
              fontWeight: form.disputeType === key ? 700 : 400,
              cursor: 'pointer',
              fontFamily: 'var(--font-open-sans)',
              transition: 'all 0.15s',
              width: '100%',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Form fields — single column on mobile, two columns on wider screens.
          CSS grid with auto-fit handles the breakpoint without media queries. */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
      }}>
        {[
          { key: 'tenantName', label: t.letterTenantName },
          { key: 'landlordName', label: t.letterLandlordName },
          { key: 'tenantAddress', label: t.letterTenantAddress },
          { key: 'landlordAddress', label: t.letterLandlordAddress },
        ].map(({ key, label }) => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>{label}</label>
            <input
              type="text"
              value={form[key as keyof LetterInput] as string}
              onChange={(e) => update(key as keyof LetterInput, e.target.value)}
              placeholder={label}
              style={inputStyle}
            />
          </div>
        ))}
      </div>

      {/* Full-width fields below the grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>{t.letterRentalAddress}</label>
          <input
            type="text"
            value={form.rentalAddress}
            onChange={(e) => update('rentalAddress', e.target.value)}
            placeholder="Musterstraße 1, 10115 Berlin"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
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

        {/* Details textarea — the most important field.
            The more specific the user is, the better the generated letter. */}
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
        {loading ? t.letterGenerating : t.letterGenerateBtn}
      </button>

      {/* Generated letter — serif font gives it a document feel
          that matches what a real formal German letter looks like */}
      {letter && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            background: '#F9FAFB', border: '1px solid #E5E7EB',
            borderRadius: '12px', padding: '20px',
            fontFamily: 'Georgia, serif', fontSize: '13px',
            lineHeight: 1.9, color: '#1A1A1A', whiteSpace: 'pre-wrap',
            maxHeight: '500px', overflowY: 'auto',
          }}>
            {letter}
          </div>

          {/* Action buttons stack on mobile, side by side on wider screens */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={download} style={{ ...actionBtnStyle('#0D5C63'), flex: '1 1 140px' }}>
              {t.letterDownload}
            </button>
            <button onClick={copy} style={{ ...actionBtnStyle(copied ? '#22C55E' : '#F4A035'), flex: '1 1 140px' }}>
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