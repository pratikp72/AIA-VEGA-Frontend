import React from 'react';
import Image from 'next/image';
import { TRANSITION_DURATION } from '../../constants/loginImages';

/**
 * Background grid component with animated images
 * @param {Object} props
 * @param {string[]} props.images - Array of image filenames to display
 */
const BackgroundGrid = ({ images }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      gridTemplateRows: 'repeat(8, 1fr)',
      gap: '2px',
      zIndex: 0,
    }}>
      {images.map((currentImg, cellIndex) => (
        <div
          key={cellIndex}
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Image
            key={currentImg}
            src={`/login-bg/${currentImg}`}
            alt={`background-${cellIndex}`}
            fill
            sizes="(max-width: 768px) 12vw, (max-width: 1200px) 10vw, 12vw"
            style={{
              objectFit: 'cover',
              transition: `opacity ${TRANSITION_DURATION}ms ease-out`,
            }}
            priority={cellIndex < 20}
            quality={75}
          />
        </div>
      ))}
    </div>
  );
};

export default BackgroundGrid;
