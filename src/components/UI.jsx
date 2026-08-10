import React from 'react';
import '../styles/components.css';
import { useState,useEffect,useRef } from 'react';
// 🟢 ADD THESE INPORTS TO THE TOP OF YOUR UI.JSX FILE:
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
// 🟢 TO THIS EXACTLY:
import Map, { Source, Layer, Marker } from 'react-map-gl/maplibre'; // Added /maplibre path target
import 'maplibre-gl/dist/maplibre-gl.css';
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false, 
  disabled = false,
  ...props 
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${disabled ? 'btn-disabled' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export const Input = ({
  label,
  type = 'text',
  error = null,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input
        type={type}
        className={`form-input ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export const Select = ({
  label,
  options,
  error = null,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select
        className={`form-input ${error ? 'error' : ''} ${className}`}
        {...props}
      >
        <option value="">Select {label?.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export const Card = ({ children, className = '' }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal modal-${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export const Alert = ({ type = 'info', message, onClose }) => {
  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
};

export const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="loader">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
};


export const LocationInput = ({ placeholder, onLocationSelect, label }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // A persistent ref to store our active typing timeout timer
  const debounceTimerRef = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear the previous timer whenever the user types another character
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.length > 2) {
      setLoading(true);

      // 🟢 THE SHIELD: Wait 500ms before actually making the network call
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;
          const response = await fetch(
            `https://us1.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${encodeURIComponent(value)}&limit=5&format=json`
          );
          
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error("LocationIQ API autocomplete error:", error);
        } finally {
          setLoading(false);
        }
      }, 500); // 500ms typing delay threshold

    } else {
      setSuggestions([]);
      setLoading(false);
    }
  };

  const handleSelect = (locationObj) => {
    setQuery(locationObj.display_name);
    setSuggestions([]);
    onLocationSelect(locationObj.display_name);
  };

  // Cleanup active timers if the user suddenly exits the page
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return (
    <div className="location-input-container" style={{ position: 'relative', width: '100%' }}>
      <Input
        label={label}
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder={placeholder}
        autoComplete="off"
      />

      {loading && (
        <div style={{ position: 'absolute', right: '15px', top: label ? '40px' : '12px', fontSize: '12px', color: '#888', zIndex: 1001 }}>
          Searching...
        </div>
      )}
      
      {suggestions.length > 0 && (
        <ul style={{ position: 'absolute', background: '#ffffff', border: '1px solid #ccc', borderRadius: '4px', padding: 0, margin: '2px 0 0 0', width: '100%', zIndex: 9999, display: 'block', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', maxHeight: '250px', overflowY: 'auto' }}>
          {suggestions.map((loc) => (
            <li 
              key={loc.place_id} 
              onMouseDown={() => handleSelect(loc)}
              style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '14px', color: '#333', textAlign: 'left', background: '#ffffff', listStyleType: 'none' }}
              onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.background = '#ffffff'}
            >
              📍 <span style={{ marginLeft: '5px' }}>{loc.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


export const RouteMap = ({ sourceText, destinationText, rideId, role }) => {
  const [coordinates, setCoordinates] = useState({ src: null, dest: null });
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [viewState, setViewState] = useState({ longitude: 77.5946, latitude: 12.9716, zoom: 11 }); 

  const [carLocation, setCarLocation] = useState(null); 
  const stompClientRef = useRef(null);
  
  // 🟢 THROTTLE SHIELD REF: Stores the timestamp of the last transmitted GPS coordinate frame
  const lastEmittedTimeRef = useRef(0);

  // 1. Geocode Address Strings to coordinate pairs [lon, lat] (Runs only when address changes)
  useEffect(() => {
    if (!sourceText || !destinationText) return;
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchMapCoordinates = async () => {
      try {
        const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;
        const srcRes = await fetch(`https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(sourceText)}&format=json&limit=1`);
        await sleep(600);
        const destRes = await fetch(`https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(destinationText)}&format=json&limit=1`);

        if (srcRes.ok && destRes.ok) {
          const srcData = await srcRes.json();
          const destData = await destRes.json();
          const srcCoords = [parseFloat(srcData[0].lon), parseFloat(srcData[0].lat)];
          const destCoords = [parseFloat(destData[0].lon), parseFloat(destData[0].lat)];

          setCoordinates({ src: srcCoords, dest: destCoords });
          setViewState(prev => ({ ...prev, longitude: srcCoords[0], latitude: srcCoords[1], zoom: 12 }));
        }
      } catch (err) {
        console.error("Failed to geocode route address strings:", err);
      }
    };
    fetchMapCoordinates();
  }, [sourceText, destinationText]);

  // 2. 🟢 DYNAMIC DRIVING DIRECTIONS: Draws route from driver to destination, or fallback from pickup to destination
  useEffect(() => {
    if (!coordinates.dest) return;

    // Prioritize the live driver's position (carLocation), fallback to source pickup coordinates if car is offline
    const startCoords = carLocation ? carLocation : coordinates.src;
    if (!startCoords) return;

    const fetchDynamicRouteLine = async () => {
      try {
        const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;
        const routeRes = await fetch(
          `https://us1.locationiq.com/v1/directions/driving/${startCoords[0]},${startCoords[1]};${coordinates.dest[0]},${coordinates.dest[1]}?key=${apiKey}&overview=full&geometries=geojson`
        );

        if (routeRes.ok) {
          const routeData = await routeRes.json();
          setRouteGeoJSON({ type: 'Feature', properties: {}, geometry: routeData.routes[0].geometry });
        }
      } catch (err) {
        console.error("Failed to load visual route track paths safely:", err);
      }
    };
    fetchDynamicRouteLine();
  }, [coordinates.src, coordinates.dest, carLocation]); // Redraws dynamically whenever the car location moves!

  // 3. RATE-LIMITED WEB SOCKET CONNECTIVITY LOOP HOOK (Throttled GPS Emission)
  useEffect(() => {
    if (!rideId || rideId === "preview") {
      setCarLocation(null);
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws-tracking');
    const client = Stomp.over(socket);
    client.debug = null; 

    client.connect({}, () => {
      stompClientRef.current = client;

      if (role === 'STUDENT') {
        client.subscribe(`/topic/ride/${rideId}`, (message) => {
          const locationData = JSON.parse(message.body);
          setCarLocation([locationData.longitude, locationData.latitude]);
          setViewState(prev => ({ ...prev, longitude: locationData.longitude, latitude: locationData.latitude }));
        });
      }
    }, (err) => console.error("WebSocket network tunnel failure", err));

    let watchId = null;
    if (role === 'DRIVER' && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          
          // Always update the local map immediately for zero visual UI lag
          setCarLocation([longitude, latitude]);

          const now = Date.now();
          // Only emit WebSocket packets if 5 seconds (5000ms) has elapsed since the last update
          if (now - lastEmittedTimeRef.current >= 5000) {
            if (stompClientRef.current && stompClientRef.current.connected) {
              stompClientRef.current.send("/app/driver/move", {}, JSON.stringify({
                rideId: rideId,
                latitude: latitude,
                longitude: longitude
              }));
              lastEmittedTimeRef.current = now;
            }
          }
        },
        (err) => console.error("Hardware GPS sensor streaming interrupted", err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (stompClientRef.current) stompClientRef.current.disconnect();
    };
  }, [rideId, role]);

  return (
    <div style={{ width: '100%', height: '350px', borderRadius: '8px', overflow: 'hidden', marginTop: '15px', border: '1px solid #ddd' }}>
      <Map 
        longitude={viewState.longitude}
        latitude={viewState.latitude}
        zoom={viewState.zoom}
        onMove={evt => setViewState(evt.viewState)} 
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        {coordinates.src && <Marker longitude={coordinates.src[0]} latitude={coordinates.src[1]} color="#2ecc71" />}
        {coordinates.dest && <Marker longitude={coordinates.dest[0]} latitude={coordinates.dest[1]} color="#e74c3c" />}
        
        {carLocation && (
          <Marker longitude={carLocation[0]} latitude={carLocation[1]}>
            <div style={{ fontSize: '28px', transform: 'translate(-50%, -50%)', transition: 'all 0.4s linear' }}>🚗</div>
          </Marker>
        )}

        {routeGeoJSON && (
          <Source id="route-source" type="geojson" data={routeGeoJSON}>
            <Layer id="route-layer" type="line" layout={{ 'line-join': 'round', 'line-cap': 'round' }} paint={{ 'line-color': '#3498db', 'line-width': 5, 'line-opacity': 0.85 }} />
          </Source>
        )}
      </Map>
    </div>
  );
};
