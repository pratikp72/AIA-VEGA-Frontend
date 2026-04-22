import React from 'react';
import Image from 'next/image';
import { TRANSITION_DURATION, GRID_SIZE } from '../../constants/loginImages';

/**
 * @param {{ id, cellIndex, image, visible }[]} slots
 */
const BackgroundGrid = ({ slots = [] }) => {
  const slotMap = React.useMemo(() => {
    const map = {};
    slots.forEach(({ id, cellIndex, image, visible }) => {
      map[cellIndex] = { id, image, visible };
    });
    return map;
  }, [slots]);

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
      {Array.from({ length: GRID_SIZE }, (_, cellIndex) => {
        const slot = slotMap[cellIndex];
        return (
          <div
            key={cellIndex}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {slot?.image && (
              <Image
                key={slot.id}
                src={`/login-bg/${slot.image}`}
                alt={`bg-${cellIndex}`}
                fill
                loading="eager"
                sizes="12vw"
                style={{
                  objectFit: 'cover',
                  opacity: slot.visible ? 1 : 0,
                  transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
                }}
                quality={75}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BackgroundGrid;
