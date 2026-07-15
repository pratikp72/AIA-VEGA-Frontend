"use client";

import React from "react";
import MarkdownIt from "markdown-it";
import PageHeader from "@/components/common/PageHeader";
import PageContainer from "@/components/layout/PageContainer";
import Select from "@/components/ui/select";
import Loader from "@/components/common/Loader";
import { fetchLocationsList } from "@/features/location/locationAPI";
import { fetchLocationRoutes } from "@/features/routes/routesAPI";

export default function RoutesPage() {
  const [locations, setLocations] = React.useState([]);
  const [selectedLocationId, setSelectedLocationId] = React.useState("");
  const [locationDetail, setLocationDetail] = React.useState(null);
  const [selectedUnitId, setSelectedUnitId] = React.useState("");
  const [selectedRouteId, setSelectedRouteId] = React.useState("");
  const [availableShifts, setAvailableShifts] = React.useState([]);
  const [selectedShift, setSelectedShift] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const breadcrumbs = [{ label: "Routes" }];

  const md = React.useMemo(() => new MarkdownIt({ html: true, breaks: true }), []);

  const selectedLocation = React.useMemo(
    () =>
      locations.find(
        (loc) =>
          String(loc.documentId ?? loc.id) === String(selectedLocationId),
      ) || null,
    [locations, selectedLocationId],
  );

  const activeUnit = React.useMemo(() => {
    if (
      !locationDetail ||
      !Array.isArray(locationDetail.units) ||
      !locationDetail.units.length ||
      !selectedUnitId
    ) {
      return null;
    }
    const match = locationDetail.units.find(
      (u) => String(u.unitId ?? u.id) === String(selectedUnitId),
    );
    return match || null;
  }, [locationDetail, selectedUnitId]);

    const noteHtml = React.useMemo(() => {
    const note = activeUnit?.note;
    if (typeof note !== "string" || !note.trim()) return "";
    const normalizedNote = note
      .replace(/\r\n/g, "\n")
      // Convert malformed bullet prefixes like ".-text" or "-text" into valid markdown "- text".
      .replace(/^\s*[.।]??\s*[-*+]\s*(\S.*)$/gm, "- $1")
      // Convert malformed ordered prefixes like "1.text" into valid markdown "1. text".
      .replace(/^\s*(\d+)[.)]\s*(\S.*)$/gm, "$1. $2")
      // Ensure numbered/bulleted lists start as a markdown block after plain text lines.
      .replace(/([^\n])\n((?:\d+[.)]|[-*+])\s+)/g, "$1\n\n$2");
    return md.render(normalizedNote);
  }, [activeUnit, md]);


  // Route selector: find the selected route in the active unit
  const activeRoute = React.useMemo(() => {
    if (!activeUnit || !Array.isArray(activeUnit.routes) || !selectedRouteId) return null;
    return activeUnit.routes.find(
      (r) => String(r.routeId ?? r.id) === String(selectedRouteId)
    ) || null;
  }, [activeUnit, selectedRouteId]);

  // Stops for the selected route and shift
 const stops = React.useMemo(() => {
  if (!activeRoute || !selectedShift) return [];

  return activeRoute.stops
    .map((stop) => {
      const shift = stop.shifts.find((s) => s.name === selectedShift);
      if (!shift) return null;

      return {
        name: stop.name,
        time: shift.time,
        locationLink: stop.locationLink,
      };
    })
    .filter(Boolean);
}, [activeRoute, selectedShift]);

  const handleLocationChange = (name) => {
    const loc = locations.find((l) => l.name === name);
    setSelectedLocationId(loc ? String(loc.documentId ?? loc.id ?? "") : "");
    // Reset unit and shift when location changes
    setSelectedUnitId("");
    setSelectedShift("");
  };

  const handleUnitChange = (unitName) => {
    if (!locationDetail || !Array.isArray(locationDetail.units)) return;
    const unit = locationDetail.units.find((u) => u.unitName === unitName);
    setSelectedUnitId(unit ? String(unit.unitId ?? unit.id ?? "") : "");
    // When unit changes, reset route and shift
    setSelectedRouteId("");
    setSelectedShift("");
  };

  const handleRouteChange = (routeName) => {
    if (!activeUnit || !Array.isArray(activeUnit.routes)) return;
    const route = activeUnit.routes.find((r) => r.name === routeName);
    setSelectedRouteId(route ? String(route.routeId ?? route.id ?? "") : "");
    setSelectedShift("");
  };

  // Load locations list on mount
  React.useEffect(() => {
    setLoading(true);
    setError("");
    fetchLocationsList()
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setLocations(arr);
        if (arr.length > 0) {
          const firstId = String(arr[0].documentId ?? arr[0].id ?? "");
          setSelectedLocationId(firstId);
        }
      })
      .catch((err) => {
        console.error("Routes locations fetch failed:", err);
        setError("Failed to load locations.");
        setLocations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Load full routes data when location changes
  React.useEffect(() => {
    if (!selectedLocationId) {
      setLocationDetail(null);
      setAvailableShifts([]);
      setSelectedShift("");
      return;
    }
    setLoading(true);
    setError("");
    fetchLocationRoutes(selectedLocationId)
      .then((detail) => {
        setLocationDetail(detail);
        // Clear any previously selected unit so user must pick explicitly
        setSelectedUnitId("");
      })
      .catch((err) => {
        console.error("Location routes fetch failed:", err);
        setError("Failed to load routes for this location.");
        setLocationDetail(null);
        setAvailableShifts([]);
        setSelectedShift("");
      })
      .finally(() => setLoading(false));
  }, [selectedLocationId]);

  // Derive available shifts from active route's shifts
  React.useEffect(() => {
  if (!activeRoute) {
    setAvailableShifts([]);
    setSelectedShift("");
    return;
  }

  const shiftSet = new Set();

  activeRoute.stops.forEach((stop) => {
    stop.shifts.forEach((s) => {
      if (s.name) shiftSet.add(s.name);
    });
  });

  const list = Array.from(shiftSet);
  setAvailableShifts(list);

  if (list.length && !list.includes(selectedShift)) {
    setSelectedShift(list[0]);
  }
}, [activeRoute]);

  const routesBgStyle = {
    backgroundImage: 'url(/location-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  // Use route image if available, else unit image, else fallback
 const routeImageSrc =
  selectedRouteId && activeRoute?.image
    ? activeRoute.image
    : null;
  return (
    <div className="min-h-screen" style={routesBgStyle}>
      <PageHeader title="Routes" breadcrumbs={breadcrumbs} showBreadcrumbSeparator>
        <p className="text-body text-muted-foreground max-w-3xl sm:max-w-5xl">
          Access a detailed directory of all plant sites, unit locations, and
          bus routes with shift‑wise timings.
        </p>
      </PageHeader>

      <PageContainer className="pt-3 space-y-6">
        {/* Location selector (full width) */}
        <div className="w-full">
          <div className="font-semibold text-[18px] text-[#363A4D] mb-2">
            Select Location
          </div>
          <div className="rounded-xl py-2">
            <div className="w-full">
              <Select
                value={selectedLocation?.name ?? ""}
                onChange={handleLocationChange}
                options={locations.map((loc) => loc.name)}
                placeholder="Select Location"
                textSize="text-base"
                variant="filter"
              />
            </div>
          </div>
        </div>

        {/* Top controls: unit + route + shift (horizontal, identical styling) */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
          {/* Unit / Plant dropdown */}
          <div className="w-full min-w-0">
            <div className="font-semibold text-[18px] text-[#363A4D] mb-2">
              Select Unit 
            </div>
            <div className="rounded-xl py-2">
              <div className="w-full">
                <Select
                  value={activeUnit?.unitName ?? ""}
                  onChange={handleUnitChange}
                  options={
                    locationDetail?.units && locationDetail.units.length > 0 && selectedLocationId
                      ? locationDetail.units.map((u) => u.unitName)
                      : []
                  }
                  placeholder={
                    selectedLocationId
                      ? (locationDetail?.units && locationDetail.units.length > 0 ? "Select Unit" : "No units available")
                      : "Select location first"
                  }
                  textSize="text-base"
                  wrapValue
                  variant="filter"
                  disabled={!selectedLocationId || !(locationDetail?.units && locationDetail.units.length > 0)}
                />
              </div>
            </div>
          </div>

          {/* Route dropdown */}
          <div className="w-full min-w-0">
            <div className="font-semibold text-[18px] text-[#363A4D] mb-2">
              Select Route
            </div>
            <div className="rounded-xl py-2">
              <div className="w-full">
                <Select
                  value={activeRoute?.name ?? ""}
                  onChange={handleRouteChange}
                  options={
                    selectedUnitId && activeUnit?.routes && Array.isArray(activeUnit.routes)
                      ? activeUnit.routes.map((r) => r.name)
                      : []
                  }
                  placeholder={
                    selectedUnitId
                      ? (activeUnit?.routes && activeUnit.routes.length > 0 ? "Select Route" : "No routes available")
                      : "Select unit first"
                  }
                  textSize="text-base"
                  wrapValue
                  variant="filter"
                  disabled={!selectedUnitId || !(activeUnit?.routes && activeUnit.routes.length > 0)}
                />
              </div>
            </div>
          </div>

          {/* Shift pills */}
          <div className="w-full min-w-0">
            <div className="font-semibold text-[18px] text-[#363A4D] mb-2">
              Select Shift
            </div>
            <div className="py-2">
              <div className="relative justify-center rounded-xl bg-white border border-gray-100 shadow-sm py-2 px-4 flex flex-wrap gap-2 items-center min-h-12">
                <div className="relative flex flex-wrap gap-2 w-full">
                  {availableShifts.length > 0 ? (
                    availableShifts.map((shift) => {
                      const active = selectedShift === shift;
                      return (
                        <button
                          key={shift}
                          type="button"
                          onClick={() => {
                            if (selectedShift !== shift) {
                              setSelectedShift(shift);
                            }
                          }}
                          className={[
                            "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ",
                            active
                              ? "bg-primary text-white shadow-sm"
                              : "bg-transparent text-primary hover:cursor-pointer",
                          ].join(" ")}
                        >
                          {shift}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-gray-400">
                      No shifts available
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map + route list */}
        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : error ? (
          <div className="py-8 text-red-600">{error}</div>
        ) : !selectedUnitId ? (
          <div className="py-8 text-center text-gray-500">
            Please select a unit to continue.
          </div>
        ) : !selectedRouteId ? (
          <div className="py-8 text-center text-gray-500">
            Please select a route to view the map and stops.
          </div>
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-6 items-start">
            {/* Map image card */}
            {selectedRouteId && (
              <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden h-150">
                <img
                  src={routeImageSrc}
                  alt={activeUnit?.unitName || "Route map"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Route & time list */}
            {selectedRouteId && selectedShift && (
            <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-4  max-h-150 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    {selectedLocation?.name || ""}
                  </div>
                  <h2 className="text-base md:text-lg font-semibold text-[#111827]">
                    {(activeRoute?.name || "").toUpperCase()}{" "}STOP &amp; TIME
                  </h2>
                </div>
              </div>
              {stops.length === 0 ? (
                <div className="py-4 text-sm text-gray-500">
                  No stops found for this shift. Please choose another shift.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 flex-1 overflow-y-auto text-sm">
                  {stops.map((stop) => (
                    <li
                      key={`${stop.name}-${stop.time}`}
                      className="flex items-center justify-between py-2 px-1"
                    >
                      <span className="text-[#111827]">{stop.name}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-3">
                        {stop.time || ""}
                        {stop.locationLink && (
                          <a
                            href={stop.locationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View location"
                            className="text-primary hover:text-primary/80 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                          </a>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            )}
          </div>
        )}

        {/* Bottom panel – route description from backend note field */}
        { selectedRouteId && noteHtml ? (
          <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-6 mb-8">
            <div className="text-sm text-[#4B5563] leading-relaxed space-y-2 [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_li]:mb-1">
              <div className="font-semibold text-base text-[#111827] mb-3">નોંધ</div>
              <div dangerouslySetInnerHTML={{ __html: noteHtml }} />
            </div>
          </div>
        ) : null}
      </PageContainer>
    </div>
  );
}
