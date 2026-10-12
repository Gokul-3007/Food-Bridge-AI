import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Compass,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  Truck,
  Building,
  HeartHandshake,
  Layers,
  ChevronRight
} from 'lucide-react';
import { mapAPI } from '../services/api';

// Center updater helper component
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

// Custom Leaflet DivIcons with SVG pins
const createCustomIcon = (type, label = '') => {
  let bgColor = '#10b981'; // emerald
  let iconSvg = '';

  switch (type) {
    case 'donation':
      bgColor = '#059669'; // Emerald
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
      break;
    case 'provider':
      bgColor = '#d97706'; // Amber / Orange
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`;
      break;
    case 'ngo':
      bgColor = '#2563eb'; // Blue
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
      break;
    case 'shelter':
      bgColor = '#9333ea'; // Purple
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
      break;
    case 'userLocation':
      bgColor = '#ef4444'; // Red Pulse
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><circle cx="12" cy="12" r="6"/></svg>`;
      break;
    default:
      bgColor = '#0f766e';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"/></svg>`;
  }

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="background-color: ${bgColor}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
        ${iconSvg}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34]
  });
};

export const MapPage = () => {
  const [locations, setLocations] = useState({ donations: [], organizations: [], pickups: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [radiusFilter, setRadiusFilter] = useState('25');

  // Geolocation state
  const [userCoords, setUserCoords] = useState(null); // [lat, lng]
  const [geoError, setGeoError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Map view state
  const [mapCenter, setMapCenter] = useState([40.7488, -73.9851]); // Default Metro City / NYC Midtown
  const [zoomLevel, setZoomLevel] = useState(13);

  // Routing state
  const [routeOrigin, setRouteOrigin] = useState(null); // [lng, lat]
  const [routeDest, setRouteDest] = useState(null); // [lng, lat]
  const [routeData, setRouteData] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);

  // Nearest NGO Finder
  const [nearbyNGOs, setNearbyNGOs] = useState([]);
  const [findingNearby, setFindingNearby] = useState(false);
  const [selectedDonationForNGOs, setSelectedDonationForNGOs] = useState(null);

  const fetchMapLocations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (availabilityFilter !== 'all') params.availability = availabilityFilter;
      if (userCoords && radiusFilter) {
        params.userLat = userCoords[0];
        params.userLng = userCoords[1];
        params.maxDistance = radiusFilter;
      }

      const res = await mapAPI.getLocations(params);
      if (res.data.success) {
        setLocations(res.data.data);
      }
    } catch (err) {
      setError('Failed to load map data. Please check connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapLocations();
  }, [categoryFilter, availabilityFilter, radiusFilter]);

  // Request browser location
  const handleUseMyLocation = () => {
    setIsLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        setZoomLevel(14);
        setIsLocating(false);

        // Also set as default routing origin
        setRouteOrigin([longitude, latitude]);
      },
      (err) => {
        setIsLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Location permission denied. You can select locations directly on the map or enter coordinates.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('Current location information is unavailable.');
            break;
          case err.TIMEOUT:
            setGeoError('Location request timed out. Please try again.');
            break;
          default:
            setGeoError('An unknown error occurred while retrieving location.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Find Nearest NGOs for a selected donation
  const handleFindNearestNGOs = async (donation) => {
    setSelectedDonationForNGOs(donation);
    setFindingNearby(true);
    try {
      const [lng, lat] = donation.location.coordinates;
      const res = await mapAPI.getNearbyNGOs({
        lat,
        lng,
        radiusKm: radiusFilter || 25,
        quantity: donation.quantity,
        dietaryType: donation.dietaryType
      });

      if (res.data.success) {
        setNearbyNGOs(res.data.ngos || []);
      }
    } catch (err) {
      console.error('Failed to find nearby NGOs:', err);
    } finally {
      setFindingNearby(false);
    }
  };

  // Request Route
  const handleGetRoute = async (destCoords) => {
    if (!routeOrigin && !userCoords) {
      alert('Please click "Use My Location" or choose a pickup origin first to calculate road navigation.');
      return;
    }

    const o = routeOrigin || [userCoords[1], userCoords[0]];
    const d = destCoords;

    setRouteDest(d);
    setRoutingLoading(true);

    try {
      const res = await mapAPI.getRoute({
        originLng: o[0],
        originLat: o[1],
        destLng: d[0],
        destLat: d[1]
      });

      if (res.data && res.data.success) {
        setRouteData(res.data);
      }
    } catch (err) {
      console.error('Routing failed:', err);
    } finally {
      setRoutingLoading(false);
    }
  };

  // Filter donations by search query
  const filteredDonations = locations.donations.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.pickupAddress.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] bg-white overflow-hidden">
      {/* Top Filter and Geolocation Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-20 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search donations, address, food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="">All Categories</option>
            <option value="prepared_meals">Prepared Meals</option>
            <option value="bakery">Bakery</option>
            <option value="produce">Fresh Produce</option>
            <option value="dairy">Dairy & Chilled</option>
            <option value="packaged">Packaged</option>
          </select>

          {/* Availability */}
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="available_only">Available Only</option>
          </select>

          {/* Radius Selector */}
          <select
            value={radiusFilter}
            onChange={(e) => setRadiusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="5">Radius: 5 km</option>
            <option value="15">Radius: 15 km</option>
            <option value="25">Radius: 25 km</option>
            <option value="50">Radius: 50 km</option>
          </select>

          {/* Use My Location Button */}
          <button
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>
        </div>
      </div>

      {/* Geolocation Notice Banner */}
      {geoError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{geoError}</span>
          </div>
          <button
            onClick={() => setGeoError(null)}
            className="text-amber-800 hover:font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Map + Sidebar Workspace */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Responsive Interactive Sidebar */}
        <div className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col z-10 overflow-y-auto">
          {/* Active Navigation Panel */}
          {routeData && (
            <div className="p-4 bg-emerald-50 border-b border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  Active Road Route
                </span>
                <button
                  onClick={() => {
                    setRouteData(null);
                    setRouteDest(null);
                  }}
                  className="text-xs text-emerald-700 hover:underline"
                >
                  Clear Route
                </button>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-emerald-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Distance</span>
                  <span className="text-base font-extrabold text-emerald-800">{routeData.distanceKm} km</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Est. Travel</span>
                  <span className="text-base font-extrabold text-emerald-800">~{routeData.durationMin} mins</span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-700 mt-2 font-medium">
                {routeData.summary}
              </p>

              {/* External Navigation Link */}
              {routeDest && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${routeDest[1]},${routeDest[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors"
                >
                  <span>Open in External Navigation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Nearest NGOs Panel */}
          {selectedDonationForNGOs && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-blue-600" />
                  Nearest Eligible NGOs
                </span>
                <button
                  onClick={() => setSelectedDonationForNGOs(null)}
                  className="text-xs text-blue-700 hover:underline"
                >
                  Close
                </button>
              </div>

              <p className="text-xs text-blue-800 mt-1">
                For: <span className="font-semibold">{selectedDonationForNGOs.title}</span> ({selectedDonationForNGOs.quantity} {selectedDonationForNGOs.unit})
              </p>

              {findingNearby ? (
                <div className="py-4 text-center text-xs text-blue-600">Calculating distances and capacity...</div>
              ) : nearbyNGOs.length === 0 ? (
                <div className="py-3 text-xs text-blue-700 italic">No verified NGOs found within configured radius.</div>
              ) : (
                <div className="mt-2.5 space-y-2 max-h-52 overflow-y-auto pr-1">
                  {nearbyNGOs.map((item) => (
                    <div
                      key={item.organization._id}
                      className="p-2.5 bg-white rounded-lg border border-blue-200 shadow-xs hover:border-blue-400 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800">{item.organization.name}</span>
                        <span className="text-xs font-bold text-blue-700">{item.distanceKm} km</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.organization.address}</p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px]">
                        <span className="text-emerald-700 font-medium">
                          Capacity: {item.remainingCapacity} available
                        </span>
                        <button
                          onClick={() => {
                            const [lng, lat] = item.organization.location.coordinates;
                            setMapCenter([lat, lng]);
                            setZoomLevel(15);
                            handleGetRoute([lng, lat]);
                          }}
                          className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                        >
                          Route <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* List of Active Donations */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Food Rescue Listings ({filteredDonations.length})
            </span>
            <span className="text-[11px] text-slate-400">Click marker or card</span>
          </div>

          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
            {filteredDonations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No surplus food listings match your filter criteria.
              </div>
            ) : (
              filteredDonations.map((d) => (
                <div
                  key={d._id}
                  className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (d.location && d.location.coordinates) {
                      const [lng, lat] = d.location.coordinates;
                      setMapCenter([lat, lng]);
                      setZoomLevel(15);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 leading-snug">{d.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      d.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {d.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{d.description}</p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-emerald-700">
                      {d.quantity} {d.unit}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3 h-3" />
                      Collect by {new Date(d.collectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFindNearestNGOs(d);
                      }}
                      className="px-2 py-1 text-[10px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
                    >
                      Find Nearest NGOs
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const [lng, lat] = d.location.coordinates;
                        handleGetRoute([lng, lat]);
                      }}
                      className="px-2 py-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                    >
                      Get Route
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leaflet Map Component */}
        <div className="flex-1 h-full relative">
          <MapContainer
            center={mapCenter}
            zoom={zoomLevel}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <ChangeView center={mapCenter} zoom={zoomLevel} />

            {/* OpenStreetMap Standard Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location Marker */}
            {userCoords && (
              <Marker
                position={userCoords}
                icon={createCustomIcon('userLocation')}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold text-red-600">Your Current Location</p>
                    <p className="text-slate-500 mt-0.5">Navigation origin</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Donation Markers */}
            {locations.donations.map((d) => {
              if (!d.location || !d.location.coordinates) return null;
              const [lng, lat] = d.location.coordinates;
              return (
                <Marker
                  key={`don-${d._id}`}
                  position={[lat, lng]}
                  icon={createCustomIcon('donation')}
                >
                  <Popup>
                    <div className="text-xs p-1 max-w-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900">{d.title}</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800">
                          {d.status}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-1">{d.description}</p>
                      <p className="font-semibold text-emerald-700">
                        {d.quantity} {d.unit} • {d.category.replace('_', ' ')}
                      </p>
                      <p className="text-slate-500 mt-1">📍 {d.pickupAddress}</p>
                      <p className="text-amber-800 mt-0.5 font-medium">
                        ⏰ Deadline: {new Date(d.collectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-200 flex gap-1.5">
                        <button
                          onClick={() => handleFindNearestNGOs(d)}
                          className="w-full py-1 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700"
                        >
                          Find Nearest NGOs
                        </button>
                        <button
                          onClick={() => handleGetRoute([lng, lat])}
                          className="w-full py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700"
                        >
                          Navigate Here
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Organization Markers */}
            {locations.organizations.map((org) => {
              if (!org.location || !org.location.coordinates) return null;
              const [lng, lat] = org.location.coordinates;
              const isNgo = ['ngo', 'shelter', 'community_kitchen', 'food_bank'].includes(org.type);
              const markerType = isNgo ? (org.type === 'shelter' ? 'shelter' : 'ngo') : 'provider';

              return (
                <Marker
                  key={`org-${org._id}`}
                  position={[lat, lng]}
                  icon={createCustomIcon(markerType)}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-slate-900">{org.name}</span>
                        {org.isVerified && (
                          <span className="text-[10px] text-emerald-600 font-bold">✓ Verified</span>
                        )}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase font-bold">
                        {org.type.replace('_', ' ')}
                      </span>
                      <p className="text-slate-600 mt-1">📍 {org.address}</p>
                      <p className="text-slate-600">Capacity: {org.maxCapacity} {org.type === 'bakery' ? 'kg' : 'portions'}</p>

                      <div className="mt-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleGetRoute([lng, lat])}
                          className="w-full py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700"
                        >
                          Route to Organization
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Road Route Polyline */}
            {routeData && routeData.coordinates && (
              <Polyline
                positions={routeData.coordinates.map((c) => [c[1], c[0]])}
                color="#059669"
                weight={5}
                opacity={0.85}
              />
            )}
          </MapContainer>

          {/* Map Legend Floating Overlay */}
          <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 z-[400] text-xs">
            <span className="font-bold text-slate-800 block mb-2">Map Legend</span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                <span>Available Surplus Food</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-600"></span>
                <span>Food Providers (Hotels, Bakeries)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>Verified NGOs & Kitchens</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                <span>Shelters & Food Banks</span>
              </div>
              {userCoords && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span>Your Location</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
