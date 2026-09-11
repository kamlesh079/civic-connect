import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";

import { useEffect } from "react";

import { mapProvider } from "./mapProvider";

import "leaflet/dist/leaflet.css";

const isValidCoordinate = (latitude, longitude) => {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

const MapClickHandler = ({ onLocationSelect, selectable }) => {
  useMapEvents({
    click: (event) => {
      if (!selectable) {
        return;
      }

      onLocationSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
};

const MapCenterUpdater = ({ latitude, longitude }) => {
  const map = useMapEvents({});

  useEffect(() => {
    if (isValidCoordinate(latitude, longitude)) {
      map.setView([latitude, longitude], Math.max(map.getZoom(), 16));
    }
  }, [latitude, longitude, map]);

  return null;
};

export const IssueLocationMap = ({
  latitude,
  longitude,
  onLocationSelect,
  selectable = false,
  height = "350px",
}) => {
  const hasSelectedLocation = isValidCoordinate(latitude, longitude);

  const center = hasSelectedLocation
    ? [latitude, longitude]
    : mapProvider.defaultCenter;

  const zoom = hasSelectedLocation ? 16 : mapProvider.defaultZoom;

  return (
    <div
      className="w-full rounded-lg overflow-hidden border border-gray-300"
      style={{
        height,
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          url={mapProvider.tileUrl}
          attribution={mapProvider.attribution}
        />

        <MapClickHandler
          selectable={selectable}
          onLocationSelect={onLocationSelect}
        />

        {hasSelectedLocation && (
          <>
            <MapCenterUpdater latitude={latitude} longitude={longitude} />

            <CircleMarker
              center={[latitude, longitude]}
              radius={10}
              pathOptions={{
                weight: 3,
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export const isValidMapCoordinate = isValidCoordinate;
