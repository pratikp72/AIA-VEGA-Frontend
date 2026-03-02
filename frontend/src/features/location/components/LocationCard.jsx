import React from 'react';

export default function LocationCard({ unit }) {
  return (
    <div className="rounded-2xl shadow-md bg-white p-4 max-w-[340px] w-full">
      <img
        src={unit.image || '/placeholder.jpg'}
        alt={unit.name}
        className="w-full h-[120px] object-cover rounded-xl"
      />
      <div className="py-3">
        <div className="font-semibold text-lg text-[#6C2EB7] flex items-center mb-2">
          <span className="mr-2">📍</span> {unit.name}
        </div>
        <div className="text-gray-600 text-sm mb-2">{unit.address}</div>
        <div className="text-xs mb-1">Site Manager : <b>{unit.siteManager}</b></div>
        <div className="text-xs mb-1">HR Manager : <b>{unit.hrManager}</b></div>
        <div className="text-xs mb-2">Contact No. : <b>{unit.contact}</b></div>
        <button className="w-full bg-[#A259FF] text-white rounded-lg py-2 font-semibold text-base mt-2 transition hover:bg-[#8a3be6]">Get Direction</button>
      </div>
    </div>
  );
}
