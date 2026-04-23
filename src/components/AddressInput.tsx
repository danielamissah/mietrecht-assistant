'use client';

import { useState, useRef, useEffect } from 'react';
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Address input with Google Places autocomplete dropdown.
// Falls back gracefully to a plain text input if the API key is missing
// or the Google Maps script fails to load.
export function AddressInput({ label, value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const { suggestions, clearSuggestions } = usePlacesAutocomplete(inputValue);

  // Show dropdown only when there are suggestions and input is focused
  const showDropdown = open && suggestions.length > 0;

  // Close dropdown when user clicks outside the component
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        clearSuggestions();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clearSuggestions]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setOpen(true);
  }

  function handleSelect(description: string) {
    // Strip ", Deutschland" suffix — redundant since we already know it's Germany
    const clean = description.replace(', Deutschland', '').replace(', Germany', '');
    setInputValue(clean);
    onChange(clean);
    setOpen(false);
    clearSuggestions();
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
      <label style={labelStyle}>{label}</label>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || label}
          autoComplete="off"
          style={inputStyle}
        />
        {/* Pin icon to signal this is a location field */}
        <span style={{
          position: 'absolute', right: '12px', top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '14px', color: '#9CA3AF', pointerEvents: 'none',
        }}>
          📍
        </span>
      </div>

      {/* Autocomplete dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0, right: 0,
          background: 'white',
          border: '1.5px solid #E5E7EB',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          zIndex: 100,
          overflow: 'hidden',
        }}>
          {suggestions.map((s, i) => (
            <button
              key={s.placeId}
              onMouseDown={(e) => {
                // onMouseDown fires before onBlur so the selection registers
                e.preventDefault();
                handleSelect(s.description);
              }}
              style={{
                width: '100%',
                padding: '11px 14px',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                borderTop: i === 0 ? 'none' : '1px solid #F3F4F6',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#1A1A1A',
                fontFamily: 'var(--font-open-sans)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'none';
              }}
            >
              {/* <span style={{ color: '#9CA3AF', fontSize: '12px', flexShrink: 0 }}>📍</span> */}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.description.replace(', Deutschland', '').replace(', Germany', '')}
              </span>
            </button>
          ))}

          {/* Google attribution — required by Terms of Service */}
          <div style={{
            padding: '6px 14px',
            borderTop: '1px solid #F3F4F6',
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <span style={{ fontSize: '10px', color: '#D1D5DB' }}>powered by Google</span>
          </div>
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
  padding: '10px 36px 10px 12px',
  borderRadius: '10px',
  border: '1.5px solid #E5E7EB',
  fontSize: '14px',
  color: '#1A1A1A',
  background: 'white',
  fontFamily: 'var(--font-open-sans)',
  outline: 'none',
};