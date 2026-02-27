"use client";

import React, { useState } from 'react';
import { X, MapPin, Calendar } from 'lucide-react';
import MediaCard from './MediaCard';

export default function GalleryGrid({ items = [] }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const handleClose = () => {
    setSelectedItem(null);
  };

  const isVideo = selectedItem && ((selectedItem.media_type || selectedItem.type || '').toLowerCase() === 'video');

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((it) => (
          <div key={it.id} className="w-full">
            <MediaCard item={it} onClick={handleCardClick} />
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 " onClick={handleClose}>
          <div 
            className="relative bg-white rounded-[20px] max-w-2xl w-full max-h-[85vh] shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Content Container */}
            <div className="overflow-y-auto max-h-[calc(80vh-32px)]">
              {/* Title at Top */}
              <h2 className="text-xl font-bold text-gray-900 mb-4 pr-8">
                {selectedItem.title || 'Untitled'}
              </h2>

              {/* Media Display */}
              <div className="relative w-full bg-gray-900 rounded-[12px] overflow-hidden mb-4">
                {isVideo ? (
                  <video
                    src={(selectedItem.video?.url && (selectedItem.video?.url.startsWith('http') ? selectedItem.video?.url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${selectedItem.video?.url}`)) || selectedItem.url}
                    controls
                    controlsList="nodownload"
                    className="w-full h-auto"
                    style={{ maxHeight: '350px' }}
                    autoPlay
                    playsInline
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={(() => {
                      const url = selectedItem.image?.formats?.large?.url || selectedItem.image?.formats?.medium?.url || selectedItem.image?.formats?.thumbnail?.url || selectedItem.image?.url || selectedItem.url || selectedItem.thumbnail;
                      if (!url) return '';
                      if (url.startsWith('http')) return url;
                      return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${url}`;
                    })()}
                    alt={selectedItem.title || 'Gallery item'}
                    className="w-full h-auto object-cover"
                    style={{ maxHeight: '350px' }}
                  />
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed text-base mb-4">
                {selectedItem.description || 'This image captures a moment from an internal session or workshop conducted by the organization.'}
              </p>

              {/* Date and Location */}
              <div className="flex items-center justify-between gap-4">
                {selectedItem.date && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="font-bold">Date:</span>
                    <span>{new Date(selectedItem.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                
                {selectedItem.location && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span className="font-bold">Location:</span>
                    <span>{selectedItem.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
