import React from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

const FALLBACK_IMAGE = 'https://placehold.co/340x120/e2e8f0/94a3b8?text=No+Image';

export default function LocationCard({ unit }) {
  const siteManager = unit?.site_manager ?? unit?.siteManager ?? '';
  const hrManager = unit?.hr_manager ?? unit?.hrManager ?? '';
  const mapLink = unit?.unit_map_link ?? unit?.map_link ?? unit?.mapLink ?? '';
  const images = React.useMemo(() => {
    const list = Array.isArray(unit?.images) ? unit.images.filter(Boolean) : [];
    if (list.length > 0) return list;

    const single = unit?.image || unit?.unit_img || unit?.unit_imag;
    return single ? [single] : [FALLBACK_IMAGE];
  }, [unit]);

  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [unit?.id, images.length]);

  const imageSrc = images[currentImageIndex] || FALLBACK_IMAGE;
  const hasMultipleImages = images.length > 1;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="rounded-2xl shadow-md bg-white p-4 max-w-[340px] w-full">
      <div className="relative">
        <img
          src={imageSrc}
          alt={unit?.name ?? 'Location'}
          className="w-full h-[170px] object-cover rounded-xl bg-gray-100"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        {hasMultipleImages && (
        <>
        <button
          type="button"
          onClick={handlePrevImage}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={handleNextImage}
          aria-label="Next image"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </>
        )}
      </div>
      <div className="pt-3">
        <div className="font-semibold text-lg text-[#6C2EB7] flex items-center mb-2">
          <span className="mr-2"><MapPin className='w-4 h-4'/></span> {unit?.name ?? ''}
        </div>
        <div className="text-gray-text text-sm mb-2">{unit?.address || '—'}</div>
        <div className="text-xs mb-1">Unit Head : <b className="text-gray-text">{siteManager || '—'}</b></div>
        <div className="text-xs mb-1">HR Manager : <b className="text-gray-text">{hrManager || '—'}</b></div>
        <div className="text-xs mb-2">Contact No. : <b className="text-gray-text">{unit?.contact || '—'}</b></div>
        {mapLink ? (
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-[#A259FF] text-white rounded-lg py-2 font-semibold text-base mt-2 transition hover:bg-[#8a3be6] text-center"
          >
            Get Direction
          </a>
        ) : (
          <span className="block w-full bg-gray-300 text-gray-500 rounded-lg py-2 font-semibold text-base mt-2 text-center cursor-not-allowed">
            Get Direction
          </span>
        )}
      </div>
    </div>
  );
}
