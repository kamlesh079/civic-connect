const DEFAULT_GEOCODING_URL =
  'https://nominatim.openstreetmap.org/reverse';

const getGeocodingUrl = () => {
  return (
    import.meta.env
      .VITE_GEOCODING_URL ||
    DEFAULT_GEOCODING_URL
  );
};

export const locationService = {
  reverseGeocode: async (
    latitude,
    longitude
  ) => {
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return null;
    }

    try {
      const url =
        new URL(
          getGeocodingUrl()
        );

      url.searchParams.set(
        'lat',
        latitude
      );

      url.searchParams.set(
        'lon',
        longitude
      );

      url.searchParams.set(
        'format',
        'jsonv2'
      );

      url.searchParams.set(
        'zoom',
        '18'
      );

      const response =
        await fetch(
          url.toString(),
          {
            headers: {
              Accept:
                'application/json'
            }
          }
        );

      if (
        !response.ok
      ) {
        return null;
      }

      const data =
        await response.json();

      return (
        data.display_name ||
        null
      );
    } catch (error) {
      console.error(
        'Reverse geocoding failed:',
        error
      );

      return null;
    }
  }
};