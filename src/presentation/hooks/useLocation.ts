import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface UserLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  loading: boolean;
  error: string | null;
}

export function useLocation(): UserLocation {
  const [location, setLocation] = useState<Omit<UserLocation, 'loading' | 'error'>>({
    latitude: -6.4888,     // Tarapoto, Perú (fallback)
    longitude: -76.3603,
    address: 'Tarapoto, Perú',
    city: 'Tarapoto',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permiso de ubicación denegado');
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!mounted) return;
        const { latitude, longitude } = pos.coords;

        // Intentar obtener dirección con reverse geocoding
        let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        let city = 'Tu ubicación';
        try {
          const geocode = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          if (geocode.length > 0) {
            const g = geocode[0];
            city = g.city || g.region || g.subregion || g.name || 'Tu ubicación';
            address = [g.street, g.district, g.city, g.region]
              .filter(Boolean)
              .join(', ');
            if (!address || address.trim() === '') {
              address = `${g.name || ''}, ${g.city || g.region || ''}`.trim();
            }
          }
        } catch {
          // Si falla reverse geocoding, usamos coordenadas como fallback
          address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          city = 'Tu ubicación';
        }

        if (mounted) {
          setLocation({ latitude, longitude, address, city });
          setLoading(false);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e.message || 'Error al obtener ubicación');
          setLoading(false);
        }
      }
    })();

    return () => { mounted = false; };
  }, []);

  return { ...location, loading, error };
}
