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
  const [availableShifts, setAvailableShifts] = React.useState([]);
  const [selectedShift, setSelectedShift] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const breadcrumbs = [{ label: "Routes" }];

  const md = React.useMemo(() => new MarkdownIt({ html: true, breaks: true }), []);

  // Show notes from backend location `note` field as markdown.
  const noteHtml = React.useMemo(() => {
    const note = locationDetail?.note;
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
  }, [locationDetail, md]);

  

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

  const stops = React.useMemo(() => {
    if (!activeUnit || !selectedShift) return [];
    const out = [];
    (activeUnit.routes || []).forEach((route) => {
      const match =
        (route.shifts || []).find((s) => s.name === selectedShift) || null;
      if (match) {
        out.push({
          name: route.name,
          time: match.time,
        });
      }
    });
    return out;
  }, [activeUnit, selectedShift]);

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
    // When unit changes, reset shift so it re-derives from new unit
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

  // Derive available shifts from active unit's routes
  React.useEffect(() => {
    if (!activeUnit) {
      setAvailableShifts([]);
      setSelectedShift("");
      return;
    }
    const shiftSet = new Set();
    (activeUnit.routes || []).forEach((route) => {
      (route.shifts || []).forEach((s) => {
        if (s.name) shiftSet.add(s.name);
      });
    });
    const list = Array.from(shiftSet);
    setAvailableShifts(list);
    if (list.length && !list.includes(selectedShift)) {
      setSelectedShift(list[0]);
    }
  }, [activeUnit, selectedShift]);

  return (
    <div className="min-h-screen bg-[#F4F4F8]">
      <PageHeader title="Routes" breadcrumbs={breadcrumbs}>
        <p className="text-gray-500 text-base">
          Access a detailed directory of all plant sites, unit locations, and
          bus routes with shift‑wise timings.
        </p>
      </PageHeader>

      <PageContainer className="py-3 space-y-6">
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
              />
            </div>
          </div>
        </div>

        {/* Top controls: unit + shift (horizontal, identical styling) */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
          {/* Unit / Plant dropdown */}
          <div className="w-full min-w-0">
            <div className="font-semibold text-[18px] text-[#363A4D] mb-2">
              Select Unit / Plant
            </div>
            <div className="rounded-xl py-2">
              <div className="w-full">
                <Select
                  value={activeUnit?.unitName ?? ""}
                  onChange={handleUnitChange}
                  options={
                    locationDetail?.units
                      ? locationDetail.units.map((u) => u.unitName)
                      : []
                  }
                  placeholder="Select Unit / Plant"
                  textSize="text-base"
                  wrapValue
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
              <div className="relative justify-center rounded-[12px] bg-white border border-[#F3D4FF] py-2 px-4 flex flex-wrap gap-2 items-center min-h-[48px]">
                <div className="relative flex flex-wrap gap-2 w-full">
                  {availableShifts.length === 0 ? (
                    <span className="text-xs text-gray-400">
                      No shifts available
                    </span>
                  ) : (
                    availableShifts.map((shift) => {
                      const active = selectedShift === shift;
                      return (
                        <button
                          key={shift}
                          type="button"
                          onClick={() =>
                            setSelectedShift((prev) =>
                              prev === shift ? "" : shift,
                            )
                          }
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
        ) : !activeUnit ? (
          <div className="py-8 text-gray-500">
            No routes configured for this location.
          </div>
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-6 items-start">
            {/* Map image card */}
            <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
              <img
                src={"/routes-map.jpg"}
                alt={activeUnit.unitName || "Bus routes map"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Route & time list */}
            <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    {selectedLocation?.name || ""}
                  </div>
                  <h2 className="text-base md:text-lg font-semibold text-[#111827]">
                    {(activeUnit.unitName || "").toUpperCase()} ROUTE &amp; TIME
                  </h2>
                </div>
              </div>
              {stops.length === 0 ? (
                <div className="py-4 text-sm text-gray-500">
                  No stops found for this shift. Please choose another shift.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 max-h-[340px] overflow-y-auto text-sm">
                  {stops.map((stop) => (
                    <li
                      key={`${stop.name}-${stop.time}`}
                      className="flex items-center justify-between py-2 px-1"
                    >
                      <span className="text-[#111827]">{stop.name}</span>
                      <span className="text-xs text-[#6B7280]">
                        {stop.time ? stop.time.slice(0, 5) : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Bottom panel – route description from backend note field */}
        {noteHtml ? (
          <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-6">
            <div className="text-sm text-[#4B5563] leading-relaxed space-y-2 [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_li]:mb-1">
              <div dangerouslySetInnerHTML={{ __html: noteHtml }} />
            </div>
          </div>
        ) : null}
      </PageContainer>
    </div>
  );
}
