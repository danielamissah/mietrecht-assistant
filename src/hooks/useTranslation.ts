'use client';

import { useState, useEffect } from 'react';
import { t, Language, T } from '@/data/translations';

// Thin wrapper around the translations object.
// Reads from localStorage on mount so the user's language choice
// survives page refreshes without any server involvement.
// Defaults to English — the primary audience is expats.
export function useTranslation() {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem('mietrecht_lang') as Language | null;
    if (stored === 'en' || stored === 'de') setLang(stored);
  }, []);

  function toggleLang() {
    const next: Language = lang === 'en' ? 'de' : 'en';
    setLang(next);
    localStorage.setItem('mietrecht_lang', next);
  }

  return { t: t[lang] as T, lang, toggleLang };
}