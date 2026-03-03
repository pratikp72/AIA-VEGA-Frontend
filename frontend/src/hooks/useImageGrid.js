import { useState, useEffect } from 'react';
import { getRandomImageDifferentCategory, initializeGrid } from '../utils/imageGrid';
import { GRID_SIZE, TRANSITION_INTERVAL } from '../constants/loginImages';

/**
 * Custom hook for managing animated image grid
 * @returns {string[]} Array of current grid images
 */
export const useImageGrid = () => {
  const [gridImages, setGridImages] = useState(() => initializeGrid(GRID_SIZE));

  useEffect(() => {
    const interval = setInterval(() => {
      setGridImages(prev => 
        prev.map(currentImg => getRandomImageDifferentCategory(currentImg))
      );
    }, TRANSITION_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  return gridImages;
};
