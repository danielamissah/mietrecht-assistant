'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { RentCheck } from '@/components/RentCheck';
import { LetterGenerator } from '@/components/LetterGenerator';
import { RightsGuide } from '@/components/RightsGuide';

type Tab = 'rights' | 'rentcheck' | 'letters';

// FooterLink kept as a single-line anchor to avoid Turbopack's
// multi-line JSX attribute parsing bug in certain nesting contexts
function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#0D5C63', textDecoration: 'underline' }}>
      {label}
    </a>
  );
}

export default function Home() {
  const { t, lang, toggleLang } = useTranslation();
  const [tab, setTab] = useState<Tab>('rights');

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'rights', icon: '§', label: t.navRights },
    { id: 'rentcheck', icon: '€', label: t.navRentCheck },
    { id: 'letters', icon: '✉', label: t.navLetters },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F7', fontFamily: 'var(--font-open-sans)' }}>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'white', borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          maxWidth: '720px', margin: '0 auto',
          padding: '12px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0D5C63', whiteSpace: 'nowrap' }}>
              {t.appName}
            </span>
            <span style={{
              fontSize: '10px', fontWeight: 700,
              padding: '2px 8px', borderRadius: '999px',
              background: '#FEF3E2', color: '#C07A1A',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {t.updatedFor}
            </span>
          </div>
          <LanguageToggle lang={lang} onToggle={toggleLang} label={t.langToggle} />
        </div>
      </nav>

      <main style={{
        maxWidth: '720px', margin: '0 auto',
        padding: '16px 16px 60px',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>

        <div style={{
          background: 'linear-gradient(135deg, #0D5C63 0%, #0A4A50 100%)',
          borderRadius: '20px',
          padding: 'clamp(20px, 5vw, 36px) clamp(16px, 4vw, 32px)',
          color: 'white',
          boxShadow: '0 4px 24px rgba(13,92,99,0.18)',
        }}>
          <p style={{
            fontSize: '10px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            opacity: 0.6, marginBottom: '8px',
          }}>
            {t.heroSubtitle}
          </p>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
            fontWeight: 800, lineHeight: 1.1, marginBottom: '12px',
          }}>
            {t.heroTitle}
          </h1>
          <p style={{
            fontSize: 'clamp(13px, 3vw, 14px)',
            lineHeight: 1.7, opacity: 0.82,
            maxWidth: '520px', marginBottom: '20px',
          }}>
            {t.heroDesc}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '10px',
          }}>
            {[
              [t.heroStat1, t.heroStat1Label],
              [t.heroStat2, t.heroStat2Label],
              [t.heroStat3, t.heroStat3Label],
            ].map(([stat, label]) => (
              <div key={stat} style={{
                background: 'rgba(255,255,255,0.10)',
                borderRadius: '12px', padding: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <p style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)', fontWeight: 800, marginBottom: '4px' }}>
                  {stat}
                </p>
                <p style={{ fontSize: '11px', opacity: 0.75, lineHeight: 1.4 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          display: 'flex',
          background: 'white', borderRadius: '14px',
          padding: '4px', border: '1px solid #E5E7EB',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)', gap: '4px',
        }}>
          {tabs.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1, padding: '9px 4px',
                borderRadius: '10px', border: 'none',
                background: tab === id ? '#0D5C63' : 'transparent',
                color: tab === id ? 'white' : '#6B7280',
                fontSize: 'clamp(11px, 3vw, 13px)',
                fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-open-sans)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '5px',
                transition: 'background 0.2s',
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: '13px', flexShrink: 0 }}>{icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        <div style={{
          background: 'white', borderRadius: '20px',
          padding: 'clamp(16px, 4vw, 28px) clamp(14px, 4vw, 24px)',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
        }}>
          {tab === 'rights' && (
            <>
              <h2 style={{ fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 700, color: '#0D5C63', marginBottom: '16px' }}>
                {t.rightsTitle}
              </h2>
              <RightsGuide t={t} />
            </>
          )}
          {tab === 'rentcheck' && (
            <>
              <h2 style={{ fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 700, color: '#0D5C63', marginBottom: '16px' }}>
                {t.rentCheckTitle}
              </h2>
              <RentCheck t={t} />
            </>
          )}
          {tab === 'letters' && (
            <>
              <h2 style={{ fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 700, color: '#0D5C63', marginBottom: '16px' }}>
                {t.letterTitle}
              </h2>
              <LetterGenerator t={t} lang={lang} />
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '11px', color: '#9CA3AF', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
            {t.footerDisclaimer}
          </p>
          <p style={{ fontSize: '11px', color: '#9CA3AF' }}>
            {t.footerSources}{': '}
            <FooterLink href="https://www.gesetze-im-internet.de/bgb" label="BGB §535–§580a" />
            {' · '}
            <FooterLink href="https://www.bmj.de/mietrecht" label="BMJ" />
            {' · '}
            <FooterLink href="https://www.mieterbund.de" label="Mieterbund" />
          </p>
        </div>

      </main>
    </div>
  );
}