"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader2, Navigation, Compass } from "lucide-react";
import L from "leaflet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Custom pin HTML helpers
const startPinHtml = `
  <div class="flex items-center justify-center relative">
    <div class="absolute w-6 h-6 rounded-full bg-emerald-500/30 animate-ping"></div>
    <div class="w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white shadow-md"></div>
  </div>
`;

const destPinHtml = `
  <div class="flex items-center justify-center relative">
    <div class="absolute w-6 h-6 rounded-full bg-red-500/30 animate-ping"></div>
    <div class="w-4.5 h-4.5 rounded-full bg-red-500 border-2 border-white shadow-md"></div>
  </div>
`;

const ridePinHtml = `
  <div class="flex items-center justify-center">
    <div class="w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow-md"></div>
  </div>
`;

interface LocationData {
  address: string;
  city: string;
  lat: number;
  lng: number;
}

export interface RealLahoreMapProps {
  startLocation?: LocationData | null;
  destLocation?: LocationData | null;
  onSelectLocation?: (type: "start" | "dest", data: LocationData | null) => void;
  activeRides?: any[];
  onSelectRide?: (ride: any) => void;
  interactive?: boolean;
}

export default function RealLahoreMap({
  startLocation,
  destLocation,
  onSelectLocation,
  activeRides = [],
  onSelectRide,
  interactive = true,
}: RealLahoreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Markers & Layers references
  const startMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const rideLayersRef = useRef<L.LayerGroup | null>(null);

  // Search autocomplete states
  const [startQuery, setStartQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  // Routing stats
  const [routeStats, setRouteStats] = useState<{ distance: string; duration: string } | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // 1. Mount stylesheet dynamically
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on Lahore coordinates
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([31.5204, 74.3587], 12);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    rideLayersRef.current = L.layerGroup().addTo(map);

    // Map click reverse geocoding
    if (interactive && onSelectLocation) {
      map.on("click", async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        
        // Block clicks if suggestions are showing to allow focusout
        setIsSearchingStart(false);
        setIsSearchingDest(false);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          
          const rawAddress = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          // Shorten address format (take first 3 segments)
          const address = rawAddress.split(",").slice(0, 3).join(",").trim();
          const city = data.address?.suburb || data.address?.city || data.address?.town || "Lahore";

          const loc: LocationData = { address, city, lat, lng };

          if (!startLocation) {
            onSelectLocation("start", loc);
            setStartQuery(address);
          } else if (!destLocation) {
            onSelectLocation("dest", loc);
            setDestQuery(address);
          } else {
            // Reset and start over
            onSelectLocation("start", loc);
            onSelectLocation("dest", null);
            setStartQuery(address);
            setDestQuery("");
          }
        } catch (err) {
          console.error("Reverse geocode failed:", err);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [interactive, onSelectLocation, startLocation, destLocation]);

  // 3. Update Start/Destination markers on values change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Start marker
    if (startLocation) {
      const icon = L.divIcon({
        html: startPinHtml,
        className: "custom-leaflet-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (startMarkerRef.current) {
        startMarkerRef.current.setLatLng([startLocation.lat, startLocation.lng]);
      } else {
        startMarkerRef.current = L.marker([startLocation.lat, startLocation.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>Start:</b> ${startLocation.address}`);
      }
    } else {
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
    }

    // Destination marker
    if (destLocation) {
      const icon = L.divIcon({
        html: destPinHtml,
        className: "custom-leaflet-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng([destLocation.lat, destLocation.lng]);
      } else {
        destMarkerRef.current = L.marker([destLocation.lat, destLocation.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>Destination:</b> ${destLocation.address}`);
      }
    } else {
      if (destMarkerRef.current) {
        destMarkerRef.current.remove();
        destMarkerRef.current = null;
      }
    }
  }, [startLocation, destLocation]);

  // 4. Calculate OSRM road routes when both pins exist
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (startLocation && destLocation) {
      setIsRouting(true);
      
      const startLng = startLocation.lng;
      const startLat = startLocation.lat;
      const destLng = destLocation.lng;
      const destLat = destLocation.lat;

      fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`
      )
        .then((res) => res.json())
        .then((data) => {
          if (routePolylineRef.current) {
            routePolylineRef.current.remove();
          }

          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);

            routePolylineRef.current = L.polyline(coordinates, {
              color: "#6366f1",
              weight: 5,
              opacity: 0.8,
              lineCap: "round",
            }).addTo(map);

            // Fit boundaries to show the whole path
            map.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });

            // Display distance & travel duration
            const kms = (route.distance / 1000).toFixed(1);
            const mins = Math.round(route.duration / 60);
            setRouteStats({ distance: `${kms} km`, duration: `${mins} mins` });
          }
          setIsRouting(false);
        })
        .catch((err) => {
          console.error("OSRM Routing failed:", err);
          setIsRouting(false);
        });
    } else {
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
      }
      setRouteStats(null);
    }
  }, [startLocation, destLocation]);

  // 5. Draw active passenger rides coordinates (straight paths for preview)
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = rideLayersRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    activeRides.forEach((ride) => {
      const o = ride.origin;
      const d = ride.destination;

      if (o?.lat && o?.lng && d?.lat && d?.lng) {
        // Draw dashed commute line
        const path = L.polyline([[o.lat, o.lng], [d.lat, d.lng]], {
          color: "#4f46e5",
          weight: 3,
          dashArray: "6, 6",
          opacity: 0.6,
        });

        // Add start pin
        const startIcon = L.divIcon({
          html: ridePinHtml,
          className: "commute-ride-pin",
          iconSize: [14, 14],
        });
        const marker = L.marker([o.lat, o.lng], { icon: startIcon });

        // Bind clicks to select the ride
        if (onSelectRide) {
          path.on("click", () => onSelectRide(ride));
          marker.on("click", () => onSelectRide(ride));
        }

        path.addTo(layerGroup);
        marker.addTo(layerGroup);
      }
    });
  }, [activeRides, onSelectRide]);

  // Autocomplete search handlers
  const handleSearchChange = async (type: "start" | "dest", query: string) => {
    if (type === "start") {
      setStartQuery(query);
      if (query.length < 3) {
        setStartSuggestions([]);
        return;
      }
      setIsSearchingStart(true);
    } else {
      setDestQuery(query);
      if (query.length < 3) {
        setDestSuggestions([]);
        return;
      }
      setIsSearchingDest(true);
    }

    try {
      // Focus geocoding results within Lahore region (viewbox around Lahore)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}+Lahore&format=json&limit=5&addressdetails=1`
      );
      const data = await res.json();
      if (type === "start") {
        setStartSuggestions(data);
      } else {
        setDestSuggestions(data);
      }
    } catch (err) {
      console.error("Geocoding lookup failed:", err);
    } finally {
      if (type === "start") setIsSearchingStart(false);
      else setIsSearchingDest(false);
    }
  };

  const selectSuggestion = (type: "start" | "dest", suggestion: any) => {
    if (!onSelectLocation || !mapRef.current) return;

    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    // Shorten display name
    const rawAddress = suggestion.display_name;
    const address = rawAddress.split(",").slice(0, 3).join(",").trim();
    const city = suggestion.address?.suburb || suggestion.address?.city || suggestion.address?.town || "Lahore";

    const loc: LocationData = { address, city, lat, lng };

    onSelectLocation(type, loc);

    if (type === "start") {
      setStartQuery(address);
      setStartSuggestions([]);
    } else {
      setDestQuery(address);
      setDestSuggestions([]);
    }

    mapRef.current.setView([lat, lng], 14);
  };

  return (
    <div className="relative w-full rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-md flex flex-col">
      {/* Search Input Panels */}
      {interactive && onSelectLocation && (
        <div className="p-4 bg-neutral-50/80 backdrop-blur-xs border-b border-neutral-200 grid gap-3 sm:grid-cols-2 z-10">
          {/* Start Point Search */}
          <div className="relative">
            <Label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Start Hub</Label>
            <div className="relative">
              <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-emerald-500" />
              <Input
                placeholder="Search starting address..."
                value={startQuery}
                onChange={(e) => handleSearchChange("start", e.target.value)}
                className="h-10 pl-9 pr-8 bg-white border-neutral-200 text-xs"
              />
              {startQuery && (
                <button 
                  onClick={() => { setStartQuery(""); onSelectLocation("start", null); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 hover:text-neutral-600"
                >
                  Clear
                </button>
              )}
            </div>
            {startSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 divide-y divide-neutral-100 max-h-48 overflow-y-auto">
                {startSuggestions.map((s) => (
                  <div
                    key={s.place_id}
                    onClick={() => selectSuggestion("start", s)}
                    className="p-2.5 hover:bg-neutral-50 text-[11px] cursor-pointer text-neutral-800 leading-snug truncate"
                  >
                    {s.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Destination Search */}
          <div className="relative">
            <Label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Destination Hub</Label>
            <div className="relative">
              <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-red-500" />
              <Input
                placeholder="Search destination address..."
                value={destQuery}
                onChange={(e) => handleSearchChange("dest", e.target.value)}
                className="h-10 pl-9 pr-8 bg-white border-neutral-200 text-xs"
              />
              {destQuery && (
                <button 
                  onClick={() => { setDestQuery(""); onSelectLocation("dest", null); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 hover:text-neutral-600"
                >
                  Clear
                </button>
              )}
            </div>
            {destSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 divide-y divide-neutral-100 max-h-48 overflow-y-auto">
                {destSuggestions.map((s) => (
                  <div
                    key={s.place_id}
                    onClick={() => selectSuggestion("dest", s)}
                    className="p-2.5 hover:bg-neutral-50 text-[11px] cursor-pointer text-neutral-800 leading-snug truncate"
                  >
                    {s.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Element Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[320px] sm:h-[400px] z-0" 
      />

      {/* Route statistics overlay */}
      {routeStats && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:w-64 bg-neutral-900/90 backdrop-blur-md text-white p-3.5 rounded-xl border border-neutral-800 shadow-lg text-xs space-y-1.5 z-10 animate-in slide-in-from-bottom-2 duration-300">
          <div className="text-[10px] uppercase font-bold text-brand-400 tracking-wider flex items-center gap-1">
            <Compass className="size-3.5" /> Calculated GPS Route
          </div>
          <div className="flex justify-between items-center pt-1">
            <span>Driving Distance:</span>
            <span className="font-extrabold text-neutral-100">{routeStats.distance}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Estimated Duration:</span>
            <span className="font-extrabold text-emerald-400">{routeStats.duration}</span>
          </div>
        </div>
      )}

      {isRouting && (
        <div className="absolute bottom-4 left-4 bg-neutral-900/90 text-white px-3 py-1.5 rounded-lg border border-neutral-800 shadow-md text-xs flex items-center gap-1.5 z-10">
          <Loader2 className="size-3.5 animate-spin text-brand-500" />
          Mapping route...
        </div>
      )}
    </div>
  );
}
