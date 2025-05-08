import { useJsApiLoader, GoogleMap, Marker, Circle } from '@react-google-maps/api';
import { Box, CircularProgress, Typography, IconButton, styled } from '@mui/material';
import { useState, useCallback, useEffect, useRef } from 'react';
import { MapProps } from '../types';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import React from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCIXkS0iYMaZY5IeOkFkf5PwhiJxLA3Lh8';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 52.2297,
  lng: 21.0122
};

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  backgroundColor: 'rgba(33,150,243,0.15)',
  color: '#2196f3',
  '&:hover': {
    backgroundColor: 'rgba(33,150,243,0.35)',
  },
  zIndex: 1000,
  boxShadow: '0 2px 8px rgba(33,150,243,0.15)'
}));

const userMarkerStyle = {
  path: window.google ? window.google.maps.SymbolPath.CIRCLE : 0,
  scale: 12,
  fillColor: '#2196f3',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 3,
};

const taskMarkerStyle = {
  path: window.google ? window.google.maps.SymbolPath.CIRCLE : 0,
  scale: 10,
  fillColor: '#FFA726',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2,
};

const completedTaskMarkerStyle = {
  ...taskMarkerStyle,
  fillColor: '#4CAF50',
};

const Map = ({ tasks, userLocation, onLocationUpdate, onTaskComplete }: MapProps) => {
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [hasCentered, setHasCentered] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          onLocationUpdate(location);
        },
        (error) => {
          setError('Błąd geolokalizacji: ' + error.message);
        }
      );
    } else {
      setError('Twoja przeglądarka nie wspiera geolokalizacji');
    }
  }, [onLocationUpdate]);

  useEffect(() => {
    if (userLocation && map && !hasCentered) {
      map.panTo(userLocation);
      map.setZoom(15);
      setHasCentered(true);
    }
  }, [userLocation, map, hasCentered]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">
          Błąd ładowania mapy: {loadError.message}
        </Typography>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation || defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          fullscreenControl: true,
          zoomControl: true,
          scaleControl: true,
          streetViewControl: true,
          mapTypeControl: false,
          draggable: true,
          gestureHandling: 'greedy',
          scrollwheel: true,
          disableDoubleClickZoom: false,
        }}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={userMarkerStyle}
            title="Twoja lokalizacja"
          />
        )}

        {tasks.map((task) => (
          <React.Fragment key={task.id}>
            <Circle
              center={task.location}
              radius={task.radius}
              options={{
                fillColor: task.completed ? '#4CAF50' : '#FFA726',
                fillOpacity: 0.2,
                strokeColor: task.completed ? '#4CAF50' : '#FFA726',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                clickable: true,
                draggable: false,
                editable: false,
                visible: true,
                zIndex: 1
              }}
            />
            <Marker
              position={task.location}
              title={task.title}
              icon={task.completed ? completedTaskMarkerStyle : taskMarkerStyle}
            />
          </React.Fragment>
        ))}
      </GoogleMap>

      <StyledIconButton
        onClick={() => {
          if (map && userLocation) {
            map.panTo(userLocation);
            map.setZoom(15);
          }
        }}
        size="large"
        aria-label="center on user location"
      >
        <LocationOnIcon />
      </StyledIconButton>
    </Box>
  );
};

export default Map; 