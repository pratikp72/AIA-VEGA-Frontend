import React from 'react';

export default function LocationCard({ unit }) {
  const siteManager = unit?.site_manager ?? unit?.siteManager ?? '';
  const hrManager = unit?.hr_manager ?? unit?.hrManager ?? '';
  const mapLink = unit?.unit_map_link ?? unit?.map_link ?? unit?.mapLink ?? '';
  const imageSrc = unit?.image || unit?.unit_img || 'https://placehold.co/340x120/e2e8f0/94a3b8?text=No+Image';

  return (
    <div className="rounded-2xl shadow-md bg-white p-4 max-w-[340px] w-full">
      <img
        src={imageSrc}
        alt={unit?.name ?? 'Location'}
        className="w-full h-[120px] object-cover rounded-xl bg-gray-100"
        onError={(e) => { e.target.src = 'https://placehold.co/340x120/e2e8f0/94a3b8?text=No+Image'; }}
      />
      <div className="py-3">
        <div className="font-semibold text-lg text-[#6C2EB7] flex items-center mb-2">
          <span className="mr-2">📍</span> {unit?.name ?? ''}
        </div>
        <div className="text-gray-600 text-sm mb-2">{unit?.address || '—'}</div>
        <div className="text-xs mb-1">Site Manager : <b>{siteManager || '—'}</b></div>
        <div className="text-xs mb-1">HR Manager : <b>{hrManager || '—'}</b></div>
        <div className="text-xs mb-2">Contact No. : <b>{unit?.contact || '—'}</b></div>
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
