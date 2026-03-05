import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectLocations, selectLocationLoading } from '../locationSelectors';
import { setLocations, setLoading } from '../locationSlice';
import { fetchLocationsList, fetchUnitsByLocation } from '../locationAPI';
import LocationCard from './LocationCard';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import Select from '@/components/ui/select';
import Loader from '@/components/common/Loader';

export default function LocationsPage() {
  const locationBgStyle = {
    backgroundImage: 'url(/location-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
  };
  const dispatch = useDispatch();
  const locations = useSelector(selectLocations);
  const loading = useSelector(selectLocationLoading);

  const [units, setUnits] = React.useState([]);
  const [selectedLocationId, setSelectedLocationId] = React.useState('');
  const [unitsLoading, setUnitsLoading] = React.useState(false);
  const [fetchError, setFetchError] = React.useState(null);

  // Load dropdown options on mount (GET /unit-locations)
  React.useEffect(() => {
    dispatch(setLoading(true));
    setFetchError(null);
    fetchLocationsList()
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        dispatch(setLocations(arr));
        if (arr.length > 0) {
          setSelectedLocationId(String(arr[0].documentId ?? arr[0].id ?? ''));
        }
      })
      .catch((err) => {
        console.error('Location list fetch failed:', err);
        setFetchError(err?.message || 'Failed to load locations');
        dispatch(setLocations([]));
      })
      .finally(() => dispatch(setLoading(false)));
  }, [dispatch]);

  // Fetch units from backend filter API when location changes
  React.useEffect(() => {
    if (selectedLocationId === '') return;
    setUnitsLoading(true);
    fetchUnitsByLocation(selectedLocationId)
      .then((list) => setUnits(list))
      .catch((err) => {
        console.error('Units fetch failed:', err);
        setUnits([]);
      })
      .finally(() => setUnitsLoading(false));
  }, [selectedLocationId]);

  const handleLocationChange = (name) => {
    const loc = locations.find((l) => l.name === name);
    setSelectedLocationId(loc ? String(loc.documentId ?? loc.id ?? '') : '');
    if (!loc) setUnits([]);
  };

  const breadcrumbs = [{ label: 'Locations' }];
  const plantOptions = locations.map((loc) => loc.name);
  const selectedPlant = locations.find(
    (loc) => String(loc.documentId ?? loc.id) === selectedLocationId
  );

  return (
    <div style={locationBgStyle}>
      <PageHeader
        title="Locations"
        breadcrumbs={breadcrumbs}
      >
        <div className="text-gray-500 text-base">
          Access a detailed directory of all plant sites, unit locations, and contact details.
        </div>
      </PageHeader>
      <PageContainer className="py-4">
        <div className="mb-8">
          <div className="font-semibold text-[18px] text-[#363A4D] mb-2">Select Plant</div>
          <div className="rounded-xl py-2" style={{ maxWidth: 340 }}>
            <div className="w-full">
              <Select
                value={selectedPlant?.name ?? ''}
                onChange={handleLocationChange}
                options={plantOptions}
                placeholder="Select Plant"
                textSize="text-base"
              />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : fetchError ? (
          <div className="py-8 text-red-600">
            {fetchError}
            <p className="text-sm text-gray-500 mt-2">Ensure the Strapi server is running at {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="py-8 text-gray-500">No locations found.</div>
        ) : unitsLoading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : units.length > 0 ? (
          <div className="flex flex-wrap gap-6">
            {units.map((unit) => (
              <LocationCard key={unit?.id ?? unit?.unit_id} unit={unit} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-gray-500">No units available for this plant.</div>
        )}
      </PageContainer>
    </div>
  );
}
