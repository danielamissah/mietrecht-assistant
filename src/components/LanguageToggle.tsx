'use client';

interface Props {
  lang: string;
  onToggle: () => void;
  label: string;
}

// Simple EN/DE pill toggle.
// The active language gets the teal background; inactive is an outline.
// No icon needed — the two-letter codes are immediately recognisable.
export function LanguageToggle({ lang, onToggle, label }: Props) {
  const isEN = lang === 'en';

  return (
    <button
      onClick={onToggle}
      aria-label="Toggle language"
      style={{
        display: 'flex',
        alignItems: 'center',
        border: '1.5px solid #0D5C63',
        borderRadius: '999px',
        overflow: 'hidden',
        padding: 0,
        background: 'white',
        cursor: 'pointer',
        fontFamily: 'var(--font-open-sans)',
      }}
    >
      <span
        style={{
          padding: '5px 12px',
          fontSize: '12px',
          fontWeight: 700,
          background: isEN ? '#0D5C63' : 'white',
          color: isEN ? 'white' : '#0D5C63',
          transition: 'background 0.2s',
        }}
      >
        EN
      </span>
      <span
        style={{
          padding: '5px 12px',
          fontSize: '12px',
          fontWeight: 700,
          background: !isEN ? '#0D5C63' : 'white',
          color: !isEN ? 'white' : '#0D5C63',
          transition: 'background 0.2s',
        }}
      >
        DE
      </span>
    </button>
  );
}