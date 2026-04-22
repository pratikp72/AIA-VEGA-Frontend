import { useState, useEffect, useRef } from 'react';
import { LOGIN_BACKGROUND_IMAGES, GRID_SIZE, TRANSITION_DURATION } from '../constants/loginImages';

const COLS        = 8;
const ROWS        = GRID_SIZE / COLS; // 8
const MAX_VISIBLE = 3;   // max images on screen at once
const INTERVAL    = 2000; // ms between each new image

const ALL_IMAGES = Object.values(LOGIN_BACKGROUND_IMAGES).flat();
const SAFE_COLS  = [0, 1, 2, 5, 6, 7];
const SAFE_CELLS = Array.from({ length: ROWS }, (_, r) =>
  SAFE_COLS.map(c => r * COLS + c)
).flat();

let _uid = 0;
function uid() { return ++_uid; }

function randomImage() {
  return ALL_IMAGES[Math.floor(Math.random() * ALL_IMAGES.length)];
}

function getNextSlot(currentSlots) {
  const usedRows = new Set(currentSlots.map(s => Math.floor(s.cellIndex / COLS)));
  const usedCols = new Set(currentSlots.map(s => s.cellIndex % COLS));

  const pool = SAFE_CELLS.filter(ci => {
    const row = Math.floor(ci / COLS);
    const col = ci % COLS;
    return !usedRows.has(row) && !usedCols.has(col);
  });

  const candidates = pool.length > 0 ? pool : SAFE_CELLS.filter(ci => {
    const row = Math.floor(ci / COLS);
    return !usedRows.has(row);
  });

  const source = candidates.length > 0 ? candidates : SAFE_CELLS;
  const cellIndex = source[Math.floor(Math.random() * source.length)];
  return { id: uid(), cellIndex, image: randomImage(), visible: false };
}

export const useImageGrid = () => {
  const [slots, setSlots] = useState([]);
  const slotsRef          = useRef([]);

  useEffect(() => {
    const updateSlots = (next) => {
      slotsRef.current = next;
      setSlots([...next]);
    };

    const tick = () => {
      const current = slotsRef.current;
      const newSlot = getNextSlot(current);

      let next = [...current, newSlot];

      let removingId = null;
      if (next.length > MAX_VISIBLE) {
        removingId = next[0].id;
        next = next.map((s, i) => i === 0 ? { ...s, visible: false } : s);
      }

      updateSlots(next);

      setTimeout(() => {
        updateSlots(
          slotsRef.current.map(s => s.id === newSlot.id ? { ...s, visible: true } : s)
        );
      }, 80);

      if (removingId !== null) {
        const id = removingId;
        setTimeout(() => {
          updateSlots(slotsRef.current.filter(s => s.id !== id));
        }, TRANSITION_DURATION + 100);
      }
    };

    tick();
    const interval = setInterval(tick, INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { slots };
};
