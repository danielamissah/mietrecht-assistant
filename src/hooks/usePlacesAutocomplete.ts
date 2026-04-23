'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Suggestion {
  placeId: string;
  description: string;
}

// Google Places Autocomplete using the new importLibrary() functional API.
// The old Loader class was removed in recent versions of @googlemaps/js-api-loader.
// We now load the script tag manually and use window.google directly —
// simpler and more stable than the wrapper library.
export function usePlacesAutocomplete(inputValue: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  // Load the Google Maps script once on mount.
  // We append a <script> tag directly — avoids the loader library entirely.
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!key) {
      console.warn('NEXT_PUBLIC_GOOGLE_PLACES_API_KEY is not set');
      return;
    }

    // If already loaded by a previous render, just create the service
    if (window.google?.maps?.places) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
      setReady(true);
      return;
    }

    // Avoid injecting the script more than once
    if (document.querySelector('#google-maps-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.maps?.places) {
        serviceRef.current = new window.google.maps.places.AutocompleteService();
        setReady(true);
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };

    document.head.appendChild(script);
  }, []);

  // Fetch address predictions with a 300ms debounce.
  // Restricted to Germany (componentRestrictions) and address type only.
  const fetchSuggestions = useCallback((value: string) => {
    if (!serviceRef.current || !ready || value.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    serviceRef.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'de' },
        types: ['address'],
      },
      (predictions, status) => {
        setLoading(false);
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setSuggestions(
            predictions.map((p) => ({
              placeId: p.place_id,
              description: p.description,
            }))
          );
        } else {
          setSuggestions([]);
        }
      }
    );
  }, [ready]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, fetchSuggestions]);

  function clearSuggestions() {
    setSuggestions([]);
  }

  return { suggestions, loading, clearSuggestions };
}