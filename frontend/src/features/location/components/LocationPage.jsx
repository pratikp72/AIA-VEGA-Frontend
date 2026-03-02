import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPlants, selectSelectedPlantId, selectUnits, selectLocationLoading } from '../locationSelectors';
import { setPlants, setSelectedPlantId, setUnits, setLoading } from '../locationSlice';
import { fetchPlants, fetchUnitsByPlant } from '../locationAPI';
import LocationCard from './LocationCard';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import Select from '@/components/ui/select';
import Pagination from '@/components/common/Pagination';

export default function LocationsPage() {
  const dispatch = useDispatch();
  const plants = useSelector(selectPlants);
  const selectedPlantId = useSelector(selectSelectedPlantId);
  const units = useSelector(selectUnits);
  const loading = useSelector(selectLocationLoading);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(6);
  const totalPages = Math.max(1, Math.ceil(units.length / perPage));
  const pagedUnits = units.slice((currentPage - 1) * perPage, currentPage * perPage);

  React.useEffect(() => {
    dispatch(setLoading(true));
    fetchPlants().then((data) => {
      dispatch(setPlants(data));
      if (data.length > 0) {
        dispatch(setSelectedPlantId(data[0].id));
      }
      dispatch(setLoading(false));
    });
  }, [dispatch]);

  React.useEffect(() => {
    if (selectedPlantId) {
      dispatch(setLoading(true));
      fetchUnitsByPlant(selectedPlantId).then((data) => {
        dispatch(setUnits(data));
        setCurrentPage(1); // Reset to first page on plant change
        dispatch(setLoading(false));
      });
    }
  }, [dispatch, selectedPlantId]);

  // Breadcrumbs: Only Locations
  const breadcrumbs = [{ label: 'Locations' }];

  // Custom select options for plants
  const plantOptions = plants.map((plant) => plant.name);
  const selectedPlantName = plants.find((p) => p.id === selectedPlantId)?.name || '';

  return (
    <>
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
          <div className="font-semibold text-[18px] text-[#363A4D] mb-2">Select Unit / Plant</div>
            <div className=" rounded-xl py-2" style={{ maxWidth: 340 }}>
              <div className="w-full">
                <Select
                  value={selectedPlantName}
                  onChange={(name) => {
                    const plant = plants.find((p) => p.name === name);
                    if (plant) dispatch(setSelectedPlantId(plant.id));
                  }}
                  options={plantOptions}
                  placeholder="Select Plant"
                  textSize="text-base"
                />
              </div>
            </div>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-6">
              {pagedUnits.map(unit => (
                <LocationCard key={unit.id} unit={unit} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showSummary
              totalCount={units.length}
              perPageOptions={[3, 6, 9, 12, 15]}
              perPage={perPage}
              onPerPageChange={(n) => { setPerPage(n); setCurrentPage(1); }}
              className="mt-8"
            />
          </>
        )}
      </PageContainer>
    </>
  );
}
